import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, resumeId, coverLetterId, url } = await req.json();

    if (!jobId || !url) {
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

    // Create Application record (Mocking actual automation execution for now)
    const { data: application, error: appError } = await supabase
      .from('Application')
      .insert({
        userId: user.id,
        jobId: job.id,
        resumeId: resumeId || null,
        coverLetterId: coverLetterId || null,
        status: "Applied",
        submissionMethod: "Form",
        appliedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError) {
      throw appError;
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Form application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application via form" },
      { status: 500 }
    );
  }
}
