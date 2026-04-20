import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { id } = await req.json();

  const txn = await prisma.cashbackTransaction.update({
    where: { id },
    data: {
      status: "PAYABLE",
      payableAt: new Date(),
    },
  });

  // ✅ MOVE TO AVAILABLE BALANCE
  await prisma.wallet.update({
    where: { userId: txn.userId! },
    data: {
      availableBalance: { increment: txn.cashbackAmount },
    },
  });

  return Response.json({ ok: true });
}