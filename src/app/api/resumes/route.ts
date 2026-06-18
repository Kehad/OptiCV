import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resumes } = await supabase
      .from('Resume')
      .select('*')
      .eq('userId', user.id)
      .order('updatedAt', { ascending: false });

    return NextResponse.json(resumes || []);
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, isOriginal } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from('Resume')
      .insert({
        userId: user.id,
        title,
        content,
        isOriginal: isOriginal ?? false,
      })
      .select()
      .single();

    if (resumeError) {
      throw resumeError;
    }

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Failed to create resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

