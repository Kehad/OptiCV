import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, resumeId, coverLetterId } = await req.json();

    if (!url || !resumeId) {
      return NextResponse.json({ error: "Missing url or resumeId" }, { status: 400 });
    }

    // Get the resume
    const { data: resume } = await supabase
      .from('Resume')
      .select('*')
      .eq('id', resumeId)
      .eq('userId', user.id)
      .maybeSingle();

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Get cover letter if provided
    let coverLetterText = "";
    if (coverLetterId) {
      const { data: coverLetter } = await supabase
        .from('CoverLetter')
        .select('content')
        .eq('id', coverLetterId)
        .eq('userId', user.id)
        .maybeSingle();
      if (coverLetter) {
        coverLetterText = coverLetter.content;
      }
    }

    // Launch Playwright with fallbacks for local browsers if playwright binaries aren't installed
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
    } catch (e) {
      console.warn("Playwright chromium not found, falling back to msedge...");
      try {
        browser = await chromium.launch({ headless: true, channel: "msedge" });
      } catch (e2) {
        console.warn("msedge not found, falling back to chrome...");
        browser = await chromium.launch({ headless: true, channel: "chrome" });
      }
    }
    
    const context = await browser.newContext();
    const page = await context.newPage();

    // console.log('context', context)
    // console.log('page', page)

    // Navigate to URL
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      await browser.close();
      return NextResponse.json({ error: "Failed to load the application URL" }, { status: 400 });
    }

    // Extract form fields
    const fields = await page.evaluate(async () => {
      const isGoogleForm = window.location.href.includes('docs.google.com/forms/') || !!document.querySelector('form[action*="formResponse"]');
      
      if (isGoogleForm) {
        const cards = Array.from(document.querySelectorAll('div.Qr7Oae, div[role="listitem"]'));
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
        
        const extracted = [];
        for (let index = 0; index < cards.length; index++) {
          const card = cards[index];
          const headingEl = card.querySelector('[role="heading"], .M7eMe, .FwR7Pc');
          let label = headingEl ? (headingEl as HTMLElement).innerText.trim() : '';
          
          if (!label) {
            label = (card as HTMLElement).innerText.split('\n')[0]?.trim() || `Question ${index + 1}`;
          }
          
          // Clean dynamic info like "* Required"
          label = label.replace(/\s*\*(\s+Required)?$/i, '').trim();
          
          const isRequired = !!card.querySelector('[aria-label="Required question"], .v37h1d, .PhX1Ic') || headingEl?.innerHTML.includes('*') || false;
          
          // Check for radio buttons
          const radioEls = Array.from(card.querySelectorAll('div[role="radio"]'));
          if (radioEls.length > 0) {
            const options = radioEls.map((el: any) => {
              return el.getAttribute('data-value') || el.getAttribute('aria-label') || el.innerText.trim();
            }).filter(Boolean);
            
            extracted.push({
              selector: `google-form-field-${index}`,
              tagName: 'google-form-field',
              type: 'radio',
              label,
              options,
              required: isRequired
            });
            continue;
          }
          
          // Check for checkboxes
          const checkboxEls = Array.from(card.querySelectorAll('div[role="checkbox"]'));
          if (checkboxEls.length > 0) {
            const options = checkboxEls.map((el: any) => {
              return el.getAttribute('data-value') || el.getAttribute('aria-label') || el.innerText.trim();
            }).filter(Boolean);
            
            extracted.push({
              selector: `google-form-field-${index}`,
              tagName: 'google-form-field',
              type: 'checkbox',
              label,
              options,
              required: isRequired
            });
            continue;
          }
          
          // Check for select/listbox dropdowns
          const listboxEl = card.querySelector('div[role="listbox"]') as HTMLElement;
          if (listboxEl) {
            let options: string[] = [];
            try {
              listboxEl.click();
              await sleep(200);
              const optionEls = Array.from(document.querySelectorAll('div[role="option"]'));
              options = optionEls.map((el: any) => el.innerText.trim()).filter(o => o && o !== 'Choose');
              listboxEl.click();
              await sleep(100);
            } catch (err) {
              console.error("Error inspecting listbox options:", err);
            }
            
            extracted.push({
              selector: `google-form-field-${index}`,
              tagName: 'google-form-field',
              type: 'select',
              label,
              options,
              required: isRequired
            });
            continue;
          }
          
          // Check for textareas
          const textareaEl = card.querySelector('textarea');
          if (textareaEl) {
            extracted.push({
              selector: `google-form-field-${index}`,
              tagName: 'textarea',
              type: 'textarea',
              label,
              required: isRequired
            });
            continue;
          }
          
          // Check for text inputs
          const inputEl = card.querySelector('input[type="text"], input[type="email"], input[type="number"], input[type="tel"], input[type="url"]') as HTMLInputElement;
          if (inputEl) {
            extracted.push({
              selector: `google-form-field-${index}`,
              tagName: 'input',
              type: inputEl.type || 'text',
              label,
              required: isRequired
            });
            continue;
          }
        }
        return extracted;
      }

      // Standard form extraction
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs.map((el: any) => {
        let label = '';
        if (el.labels && el.labels.length > 0) {
          label = el.labels[0].innerText;
        } else if (el.id) {
          const labelEl = document.querySelector(`label[for="${el.id}"]`) as HTMLElement;
          if (labelEl) label = labelEl.innerText;
        }

        if (!label && el.placeholder) {
          label = el.placeholder;
        }
        if (!label && el.getAttribute('aria-label')) {
          label = el.getAttribute('aria-label');
        }
        if (!label && el.name) {
          label = el.name;
        }

        let options = [];
        if (el.tagName.toLowerCase() === 'select') {
          options = Array.from(el.querySelectorAll('option')).map((opt: any) => opt.value || opt.text);
        }

        return {
          selector: el.id ? `#${el.id}` : (el.name ? `[name="${el.name}"]` : null),
          tagName: el.tagName.toLowerCase(),
          type: el.tagName.toLowerCase() === 'textarea' ? 'textarea' : el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder || '',
          label: label.trim(),
          options
        };
      }).filter(f => f.selector && f.type !== 'hidden' && f.type !== 'submit' && f.type !== 'button');
    });

    console.log(fields, "fields");

    await browser.close();

    if (fields.length === 0) {
      return NextResponse.json({ error: "No compatible form fields found on this page." }, { status: 400 });
    }

    // Query Groq to map fields
    const prompt = `You are an AI assistant helping to fill out a job application form.
Given the following user resume data, cover letter data (if any), and a list of form fields extracted from the application page, provide the best value to fill in each form field.
For select/radio/dropdown fields, choose the closest option from the available options.
For fields that require information not in the resume (like 'Are you legally authorized to work?'), make a safe reasonable guess based on the resume location or leave it blank.
If a field is a cover letter field, write or paste the provided cover letter content.

Resume Data:
${JSON.stringify(resume.content)}

Cover Letter:
${coverLetterText ? coverLetterText : "No cover letter provided."}

Form Fields:
${JSON.stringify(fields)}

Respond ONLY with a valid JSON object containing a "mapping" key which is an array of objects, where each object has:
- "selector": the exact selector of the field
- "value": the string value to fill in
- "label": the label of the field (for UI display)
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      max_completion_tokens: 2048,
      response_format: { type: "json_object" }
    });

    console.log(completion, "completion");

    let mapping = [];
    try {
      const result = JSON.parse(completion.choices[0].message.content || "{}");
      // Handle cases where the LLM wraps the array in an object like { "mapping": [...] }
      if (Array.isArray(result)) {
        mapping = result;
      } else {
        const key = Object.keys(result)[0];
        if (key && Array.isArray(result[key])) {
          mapping = result[key];
        }
      }
    } catch (e) {
      console.error("Failed to parse Groq response:", e);
    }

    const mergedMapping = mapping.map((mapItem: any) => {
      const fieldInfo = fields.find((f: any) => f.selector === mapItem.selector);
      return {
        ...mapItem,
        type: fieldInfo?.type || 'text',
        options: fieldInfo?.options || []
      };
    });

    return NextResponse.json({ fields, mapping: mergedMapping }, { status: 200 });

  } catch (error) {
    console.error("Inspect form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
