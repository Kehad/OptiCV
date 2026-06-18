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

    const { jobId, tone, resumeId } = await req.json();

    if (!jobId || !tone) {
      return NextResponse.json({ error: "jobId and tone are required" }, { status: 400 });
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

    // Determine which resume to use
    let resume;
    if (resumeId) {
      const { data: r } = await supabase
        .from('Resume')
        .select('*')
        .eq('id', resumeId)
        .eq('userId', user.id)
        .maybeSingle();
      resume = r;
    } else {
      // Find the most recently tailored resume for this user, or fallback to original
      const { data: r } = await supabase
        .from('Resume')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();
      resume = r;
    }

    if (!resume) {
      return NextResponse.json({ error: "No resume found to base the cover letter on" }, { status: 404 });
    }

    const prompt = `You are an expert cover letter writer.
Write a cover letter for the following job description based on the provided resume.
The tone of the cover letter should be: ${tone}. (e.g. Professional, Formal, Friendly, Startup-focused, Executive).

Job Title: ${job.title}
Company: ${job.company}
Job Keywords: ${JSON.stringify(job.extractedSkills)}

Resume Data:
${JSON.stringify(resume.content)}

Write ONLY the content of the cover letter, ready to be copied and pasted. Do not include placeholders like "[Your Name]" if the data is available in the resume. Format with clear paragraphs.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    const coverLetterContent = completion.choices[0].message.content || "";

    const { data: coverLetter, error: insertError } = await supabase
      .from('CoverLetter')
      .insert({
        userId: user.id,
        jobId: job.id,
        content: coverLetterContent,
        tone: tone,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }


    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
