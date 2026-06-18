import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
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

    const formData = await req.formData();
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    
    let description = "";
    let url = "";

    if (type === "text") {
      description = formData.get("description") as string;
    } else if (type === "url") {
      url = formData.get("url") as string;
      try {
        const res = await fetch(url);
        const html = await res.text();
        // A very simple HTML to Text extraction
        description = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
      } catch (err) {
        console.error("Failed to fetch URL", err);
        return NextResponse.json({ error: "Failed to fetch content from URL" }, { status: 400 });
      }
    } else if (type === "file") {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        const pdfData = await pdfParse(buffer);
        description = pdfData.text;
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const docxData = await mammoth.extractRawText({ buffer });
        description = docxData.value;
      } else if (file.type === "text/plain") {
        description = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Please upload PDF, DOCX, or TXT." },
          { status: 400 }
        );
      }
    }

    if (!description || description.trim() === "") {
      return NextResponse.json({ error: "Could not extract job description" }, { status: 400 });
    }

    // Now let's extract structured data using OpenAI
    const prompt = `You are an expert ATS system and recruiter.
Analyze the following job description and extract the key requirements.
Return ONLY a valid JSON object with the following structure:
- "skills": ["skill1", "skill2"] (a list of core skills required)
- "keywords": ["keyword1", "keyword2"] (important buzzwords or tools)
- "qualifications": ["qual1"] (e.g., "Bachelor's Degree", "5+ years experience")
- "atsRequirements": ["req1"] (formatting or strict requirements mentioned)

Job Description:
${description.substring(0, 6000)}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
      response_format: { type: "json_object" }
      
    });

    console.log(completion)

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}");

    // Fetch the user's latest Base Resume to calculate a mock match score
    const { data: baseResume } = await supabase
      .from('Resume')
      .select('*')
      .eq('userId', user.id)
      .eq('isOriginal', true)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    let matchScore = 0;
    if (baseResume && baseResume.content) {
      const contentStr = JSON.stringify(baseResume.content).toLowerCase();
      const skillsMatch = (parsedData.skills || []).filter((s: string) => contentStr.includes(s.toLowerCase()));
      matchScore = Math.min(100, Math.round(((skillsMatch.length / (parsedData.skills?.length || 1)) * 100) || 50));
    }

    // Create the job in the database
    const { data: job, error: jobError } = await supabase
      .from('JobDescription')
      .insert({
        userId: user.id,
        title,
        company,
        description,
        url: url || null,
        extractedSkills: parsedData,
        matchScore,
      })
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }


    return NextResponse.json({ job, parsedData }, { status: 201 });
  } catch (error) {
    console.error("Job analyze error:", error);
    return NextResponse.json(
      { error: "Failed to process job description" },
      { status: 500 }
    );
  }
}
