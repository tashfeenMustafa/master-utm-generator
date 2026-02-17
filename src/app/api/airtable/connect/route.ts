import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listBases } from "@/lib/airtable/api";

const COOKIE_NAME = "airtable_pat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid token" },
        { status: 400 }
      );
    }

    // Validate token by listing bases
    const bases = await listBases(token);

    // Store PAT in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, bases });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Airtable",
      },
      { status: 401 }
    );
  }
}
