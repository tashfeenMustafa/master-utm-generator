import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listTables } from "@/lib/airtable/api";

const COOKIE_NAME = "airtable_pat";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ baseId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { baseId } = await params;
    const tables = await listTables(token, baseId);
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tables",
      },
      { status: 500 }
    );
  }
}
