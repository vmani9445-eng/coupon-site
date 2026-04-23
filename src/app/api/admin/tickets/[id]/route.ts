import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.supportTicket.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  return Response.json({ success: true });
}