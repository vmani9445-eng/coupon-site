import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SESSION_COOKIE_NAME = "coupon_session";
const SESSION_EXPIRES_DAYS = 30;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return new TextEncoder().encode(secret);
}

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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Account disabled" },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role || "USER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_EXPIRES_DAYS}d`)
      .sign(getJwtSecret());

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * SESSION_EXPIRES_DAYS,
});

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}