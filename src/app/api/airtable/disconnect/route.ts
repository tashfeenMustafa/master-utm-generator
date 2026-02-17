import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "airtable_pat";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect",
      },
      { status: 500 }
    );
  }
}
