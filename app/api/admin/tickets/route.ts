import { prisma } from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tickets);
}