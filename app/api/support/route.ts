
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session: any = await getServerSession();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject: body.subject,
      message: body.message,
    },
  });

  return Response.json(ticket);
}

export async function GET(req: Request) {
  const session: any = await getServerSession();

  if (!session?.user?.id) {
    return Response.json([], { status: 200 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tickets);
}