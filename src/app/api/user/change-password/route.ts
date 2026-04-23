import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const cookieStore = await cookies();
const userId = cookieStore.get("userId")?.value;
  const { password, newPassword } = await req.json();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.passwordHash) {
    return Response.json({ error: "No password set" }, { status: 400 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return Response.json({ error: "Wrong password" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashed },
  });

  return Response.json({ success: true });
}