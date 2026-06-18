import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const { jobId, baseResumeId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const { data: job } = await supabase
      .from('JobDescription')
      .select('*')
      .eq('id', jobId)
      .eq('userId', user.id)
      .maybeSingle();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let baseResume;
    if (baseResumeId) {
      const { data: br } = await supabase
        .from('Resume')
        .select('*')
        .eq('id', baseResumeId)
        .eq('userId', user.id)
        .maybeSingle();
      baseResume = br;
    } else {
      // Find latest base resume
      const { data: br } = await supabase
        .from('Resume')
        .select('*')
        .eq('userId', user.id)
        .eq('isOriginal', true)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();
      baseResume = br;
    }

    if (!baseResume) {
      return NextResponse.json({ error: "No base resume found" }, { status: 404 });
    }

    const prompt = `You are an expert resume writer and ATS optimizer.
Your goal is to tailor the following base resume to perfectly match the provided job description.
Modify the summary, experience bullets, and skills to highlight the most relevant points for this specific role. Do NOT hallucinate experiences or skills the user doesn't have, but DO rephrase their existing experience to better align with the job description's keywords.

Job Title: ${job.title}
Company: ${job.company}
Job Description Skills/Keywords: ${JSON.stringify(job.extractedSkills)}

Base Resume JSON:
${JSON.stringify(baseResume.content)}

Return the tailored resume as a valid JSON object matching the exact structure of the Base Resume JSON:
{
  "personalInfo": { ... },
  "summary": "...",
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ],
  "certifications": [ ... ]
}`;

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

    const tailoredData = JSON.parse(completion.choices[0].message.content || "{}");

    // Save tailored resume
    const { data: tailoredResume, error: insertError } = await supabase
      .from('Resume')
      .insert({
        userId: user.id,
        title: `${job.title} - ${job.company} Tailored`,
        content: tailoredData,
        isOriginal: false,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }


    // Optionally update the job match score
    // In a real app, we might calculate a new match score for this tailored resume.

    return NextResponse.json({ resume: tailoredResume }, { status: 201 });
  } catch (error) {
    console.error("Resume tailor error:", error);
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
