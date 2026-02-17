import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/google/auth";

export async function POST() {
  try {
    await clearTokenCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to disconnect" },
      { status: 500 }
    );
  }
}
