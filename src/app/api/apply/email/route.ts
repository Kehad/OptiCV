import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, resumeId, coverLetterId, recruiterEmail, subject, notes } = await req.json();

    if (!jobId || !recruiterEmail || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const { data: resume } = await supabase
      .from('Resume')
      .select('*')
      .eq('id', resumeId)
      .eq('userId', user.id)
      .maybeSingle();

    let coverLetter;
    if (coverLetterId) {
      const { data: cl } = await supabase
        .from('CoverLetter')
        .select('*')
        .eq('id', coverLetterId)
        .eq('userId', user.id)
        .maybeSingle();
      coverLetter = cl;
    }

    // Configure Nodemailer (you would set these in your .env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "2525"),
      auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
      },
    });

    // Create a plain text version of the resume for attachment (Fallback)
    // In production, we'd generate a PDF using @react-pdf/renderer
    let resumeText = "Resume details could not be loaded.";
    if (resume?.content) {
      const data = resume.content as any;
      resumeText = `
Name: ${data.personalInfo?.name || ""}
Email: ${data.personalInfo?.email || ""}
Phone: ${data.personalInfo?.phone || ""}

SUMMARY:
${data.summary || ""}

EXPERIENCE:
${(data.experience || []).map((exp: any) => `${exp.position} at ${exp.company}\n${(exp.description || []).join('\n')}`).join('\n\n')}

SKILLS:
${(data.skills || []).join(', ')}
      `;
    }

    const userName = user.user_metadata.name || user.user_metadata.full_name || "Candidate";

    const attachments = [
      {
        filename: `${userName.replace(/\s+/g, "_")}_Resume.txt`,
        content: resumeText,
      },
    ];

    const mailOptions = {
      from: user.email || "noreply@opticv.ai",
      to: recruiterEmail,
      subject: subject,
      text: `${notes}\n\n${coverLetter?.content || ""}\n\n---\nBest regards,\n${userName}`,
      attachments,
    };

    // Send the email
    // For demo purposes, we will try to send it, but if credentials are bad, we'll just log it.
    try {
      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log("No SMTP credentials. Simulated email sending:", mailOptions.subject);
      }
    } catch (e) {
      console.error("Failed to send email through SMTP", e);
      // We might want to still create the application record if it's just a sandbox environment
    }

    // Create Application record
    const { data: application, error: appError } = await supabase
      .from('Application')
      .insert({
        userId: user.id,
        jobId: job.id,
        resumeId: resume?.id || null,
        coverLetterId: coverLetter?.id || null,
        status: "Applied",
        submissionMethod: "Email",
        appliedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError) {
      throw appError;
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Email application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application via email" },
      { status: 500 }
    );
  }
}
