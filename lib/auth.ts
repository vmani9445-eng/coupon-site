import { prisma } from "./prisma";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      image: true,
      phone: true,
      upiId: true,
      upiName: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive || user.status !== "ACTIVE") {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}