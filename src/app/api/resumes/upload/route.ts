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
    const file = formData.get("file") as File;

    console.log(formData) 
      console.log(file)
       console.log(user)

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf") {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else if (file.type === "text/plain") {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    // Now let's extract structured data using OpenAI
    const prompt = `You are an expert ATS system and resume parser.
Extract the following information from the provided resume text and return ONLY a valid JSON object. 
Make sure the JSON structure has the following keys:
- "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "" }
- "summary": "A brief professional summary"
- "experience": [ { "company": "", "position": "", "startDate": "", "endDate": "", "description": [""] } ]
- "education": [ { "institution": "", "degree": "", "startDate": "", "endDate": "" } ]
- "skills": ["skill1", "skill2"]
- "certifications": ["cert1"]

Resume Text:
${extractedText.substring(0, 4000)}
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

    // Create the resume in the database
    // const { data: resume, error: resumeError } = await supabase
    //   .from('Resume')
    //   .insert({
    //     userId: user.id,
    //     title: `${parsedData.personalInfo?.name || "My"} - Base Resume`,
    //     content: parsedData,
    //     isOriginal: true,
    //   })
    //   .select()
    //   .single();

    // if (resumeError) {
    //   throw resumeError;
    // }


    // return NextResponse.json({ resume, parsedData }, { status: 201 });
    return NextResponse.json({ parsedData }, { status: 201 });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
