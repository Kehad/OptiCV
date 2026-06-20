import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { message: "Registration is handled client-side via Supabase auth." },
    { status: 501 }
  );
}
