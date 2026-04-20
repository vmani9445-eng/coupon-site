import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("LOGOUT_ERROR", error);

    return NextResponse.json(
      { error: "Something went wrong during logout" },
      { status: 500 }
    );
  }
}