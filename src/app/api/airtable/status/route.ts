import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "airtable_pat";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return NextResponse.json({ authenticated: Boolean(token) });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
