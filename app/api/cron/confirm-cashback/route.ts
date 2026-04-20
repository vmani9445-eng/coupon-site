import { prisma } from "@/lib/prisma";

export async function GET() {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 3); // 3 days delay

  const txns = await prisma.cashbackTransaction.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: daysAgo,
      },
    },
  });

  for (const txn of txns) {
    await prisma.cashbackTransaction.update({
      where: { id: txn.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    await prisma.wallet.upsert({
      where: { userId: txn.userId },
      update: {
        availableBalance: {
          increment: txn.cashbackAmount,
        },
        confirmedBalance: {
          increment: txn.cashbackAmount,
        },
      },
      create: {
        userId: txn.userId,
        availableBalance: txn.cashbackAmount,
        confirmedBalance: txn.cashbackAmount,
      },
    });
  }

  return Response.json({ processed: txns.length });
}