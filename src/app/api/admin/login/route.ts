import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ❌ Invalid user
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔐 Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🚫 Only admin allowed
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // ✅ Create session (JWT cookie)
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ✅ Save session log (optional analytics)
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionKey: crypto.randomUUID(),
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          null,
        userAgent: req.headers.get("user-agent") || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    );
  }
}