import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.userId,
      subject: body.subject,
      message: body.message,
    },
  });

  return Response.json(ticket);
}

export async function GET(req: Request) {
  const session = await getSession();

  if (!session?.userId) {
    return Response.json([], { status: 200 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tickets);
}