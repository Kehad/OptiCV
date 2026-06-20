import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, resumeId, coverLetterId, url, mapping } = await req.json();

    if (!jobId || !url || !mapping) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify job belongs to user
    const { data: job } = await supabase
      .from('JobDescription')
      .select('id')
      .eq('id', jobId)
      .eq('userId', user.id)
      .maybeSingle();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Launch Playwright with fallbacks
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

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Fill form fields
      for (const field of mapping) {
        if (!field.selector || field.value === undefined || field.value === null) continue;
        
        try {
          if (field.selector.startsWith('google-form-field-')) {
            const index = parseInt(field.selector.replace('google-form-field-', ''), 10);
            // Locate the question card by finding either .Qr7Oae or div[role="listitem"]
            const questionCard = page.locator('div.Qr7Oae, div[role="listitem"]').nth(index);
            
            if (await questionCard.count() > 0) {
              if (field.type === 'radio') {
                // Click option matching field.value
                const radio = questionCard.locator('div[role="radio"]').filter({ hasText: field.value });
                if (await radio.count() > 0) {
                  await radio.first().click();
                }
              } else if (field.type === 'checkbox') {
                // Multi-select checkboxes
                const selectedOptions = Array.isArray(field.value) 
                  ? field.value 
                  : String(field.value).split(',').map((o: string) => o.trim());
                for (const optionVal of selectedOptions) {
                  const checkbox = questionCard.locator('div[role="checkbox"]').filter({ hasText: optionVal });
                  if (await checkbox.count() > 0) {
                    const ariaChecked = await checkbox.first().getAttribute('aria-checked');
                    if (ariaChecked !== 'true') {
                      await checkbox.first().click();
                    }
                  }
                }
              } else if (field.type === 'select') {
                // Google Forms listbox
                const listbox = questionCard.locator('div[role="listbox"]');
                if (await listbox.count() > 0) {
                  await listbox.first().click();
                  await page.waitForTimeout(500);
                  const option = page.locator('div[role="option"]').filter({ hasText: field.value });
                  if (await option.count() > 0) {
                    await option.first().click();
                  }
                  await page.waitForTimeout(300);
                }
              } else {
                // Text input or textarea
                const input = questionCard.locator('input[type="text"], input[type="email"], input[type="number"], input[type="tel"], input[type="url"], textarea');
                if (await input.count() > 0) {
                  await input.first().fill(String(field.value));
                }
              }
            }
          } else {
            // Standard form filling
            const element = await page.$(field.selector);
            if (element) {
              const tagName = await element.evaluate(el => el.tagName.toLowerCase());
              
              if (tagName === 'select') {
                await page.selectOption(field.selector, field.value);
              } else {
                await page.fill(field.selector, String(field.value));
              }
            }
          }
        } catch (e) {
          console.warn(`Failed to fill field ${field.selector}:`, e);
        }
      }

      // Try to find and click the submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit Application")',
        'button:has-text("Apply")',
        'button:has-text("Submit")',
        'div[role="button"]:has-text("Submit")',
        'span:has-text("Submit")'
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const submitBtn = await page.$(selector);
          if (submitBtn) {
            await submitBtn.click({ timeout: 5000 });
            submitted = true;
            break;
          }
        } catch (e) {
          // ignore error and try next selector
        }
      }

      // Optional: wait a bit for submission to process
      await page.waitForTimeout(3000);

    } catch (e) {
      await browser.close();
      return NextResponse.json({ error: "Failed during form execution" }, { status: 500 });
    }

    await browser.close();

    // Create Application record in DB
    const { data: application, error: appError } = await supabase
      .from('Application')
      .insert({
        userId: user.id,
        jobId: job.id,
        resumeId: resumeId || null,
        coverLetterId: coverLetterId || null,
        status: "Applied",
        submissionMethod: "Form",
        automationPreview: mapping,
        appliedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError) {
      throw appError;
    }

    return NextResponse.json({ application }, { status: 201 });

  } catch (error) {
    console.error("Execute form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
