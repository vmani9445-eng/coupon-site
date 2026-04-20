import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionKey =
      typeof body.sessionKey === "string" && body.sessionKey.trim()
        ? body.sessionKey.trim()
        : null;

    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : null;

    if (!sessionKey) {
      return NextResponse.json(
        { ok: false, error: "sessionKey is required" },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || null;

    let userId: string | null = null;

    if (email) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          lastSeenAt: new Date(),
          isActive: true,
        },
        create: {
          email,
          lastSeenAt: new Date(),
          isActive: true,
        },
        select: { id: true },
      });

      userId = user.id;
    }

    const session = await prisma.userSession.upsert({
      where: { sessionKey },
      update: {
        userId,
        ipAddress,
        userAgent,
        isActive: true,
        lastSeenAt: new Date(),
      },
      create: {
        sessionKey,
        userId,
        ipAddress,
        userAgent,
        isActive: true,
        lastSeenAt: new Date(),
      },
      select: {
        id: true,
        sessionKey: true,
      },
    });

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}