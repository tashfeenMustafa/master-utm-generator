import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listBases } from "@/lib/airtable/api";

const COOKIE_NAME = "airtable_pat";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const bases = await listBases(token);
    return NextResponse.json({ bases });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch bases",
      },
      { status: 500 }
    );
  }
}
