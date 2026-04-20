import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        upiId: true,
        upiName: true,
        giftCardPreference: true,
      },
    });

    // ✅ IMPORTANT FIX
    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(user);

  } catch (err) {
    console.error("USER API ERROR:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}