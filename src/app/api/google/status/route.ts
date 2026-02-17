import { NextResponse } from "next/server";
import { parseTokenCookie } from "@/lib/google/auth";

export async function GET() {
  try {
    const tokens = await parseTokenCookie();
    return NextResponse.json({ authenticated: tokens !== null });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
