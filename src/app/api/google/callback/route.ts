import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, setTokenCookie } from "@/lib/google/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/settings/connections?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/settings/connections?error=missing_code`
    );
  }

  try {
    const tokens = await exchangeCode(code);
    await setTokenCookie(tokens);
    return NextResponse.redirect(`${appUrl}/settings/connections?connected=true`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.redirect(
      `${appUrl}/settings/connections?error=${encodeURIComponent(message)}`
    );
  }
}
