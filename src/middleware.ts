import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "coupon_session";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔐 Protect all /admin routes except login page
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    // ❌ No session → redirect
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());

      const role = String(payload.role || "");

      // ❌ Not admin → redirect
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};