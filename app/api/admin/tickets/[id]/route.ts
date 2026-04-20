import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { status: "CLOSED" },
  });

  return Response.json({ success: true });
}