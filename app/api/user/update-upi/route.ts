import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const userId = cookies().get("userId")?.value;
  const { upiId, upiName } = await req.json();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { upiId, upiName },
  });

  return Response.json({ success: true });
}