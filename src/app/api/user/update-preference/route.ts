import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
const userId = cookieStore.get("userId")?.value;
  const { giftPref } = await req.json();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      giftCardPreference: giftPref,
    },
  });

  return Response.json({ success: true });
}