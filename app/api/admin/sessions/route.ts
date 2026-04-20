import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.userSession.findMany({
      orderBy: {
        lastSeenAt: "desc",
      },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("ADMIN_SESSIONS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}