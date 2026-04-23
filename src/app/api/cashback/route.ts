import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
const userId = cookieStore.get("userId")?.value;

    // ✅ If not logged in → return empty
    if (!userId) {
      return Response.json([]);
    }

    // ✅ Get cashback transactions
    const cashback = await prisma.cashbackTransaction.findMany({
      where: {
        userId,
      },
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        trackedAt: "desc",
      },
      take: 50,
    });

    return Response.json(cashback);

  } catch (err) {
    console.error("CASHBACK API ERROR:", err);

    return Response.json(
      { error: "Failed to load cashback" },
      { status: 500 }
    );
  }
}