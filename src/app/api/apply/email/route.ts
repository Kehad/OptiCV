import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, resumeId, coverLetterId, recruiterEmail, subject, notes, userEmail } = await req.json();

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

    // Send the email using SMTP (Google SMTP / Nodemailer) or Resend fallback
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpFrom = process.env.SMTP_FROM || smtpUser || "applications@example.com";

      if (smtpUser && smtpPassword) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for port 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });
        console.log(`${userName} <${userEmail}>`)
        console.log(`"${userName} <${userEmail}>"`)

        await transporter.sendMail({
          // from: smtpFrom,
          from: `${userName} <${userEmail}>`,
          to: recruiterEmail,
          subject: subject,
          text: `${notes}\n\n${coverLetter?.content || ""}\n\n---\nBest regards,\n${userName}`,
          attachments,
        });
        console.log("Email sent successfully via SMTP to:", recruiterEmail);
      } else if (process.env.RESEND_API_KEY) {
        const { data, error } = await resend.emails.send({
          from: "OptiCV <onboarding@resend.dev>", // Note: Use onboarding@resend.dev until you verify your domain on Resend
          to: recruiterEmail,
          subject: subject,
          text: `${notes}\n\n${coverLetter?.content || ""}\n\n---\nBest regards,\n${userName}`,
          attachments,
        });

        if (error) {
          throw new Error(error.message);
        }
        console.log("Email sent successfully via Resend to:", recruiterEmail);
      } else {
        console.log("No SMTP or Resend credentials found. Simulated email sending:", subject);
      }
    } catch (e) {
      console.error("Failed to send email:", e);
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
