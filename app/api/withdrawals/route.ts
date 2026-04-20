import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ✅ GET USER WITHDRAWALS
export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(withdrawals);
}

// ✅ CREATE WITHDRAWAL
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method, upiId, upiName, giftType } = await req.json();

    // 💰 Convert ₹ → paise (important if your DB uses paise)
    const amountInPaise = Number(amount);

    // ✅ VALIDATION
    if (!amountInPaise || amountInPaise < 10000) {
      return Response.json(
        { error: "Minimum withdrawal is ₹100" },
        { status: 400 }
      );
    }

    if (method === "UPI" && (!upiId || !upiName)) {
      return Response.json(
        { error: "UPI ID and Name required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔍 WALLET CHECK
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });

      if (!wallet || wallet.availableBalance < amountInPaise) {
        throw new Error("Insufficient balance");
      }

      // ❌ PREVENT MULTIPLE PENDING
      const pending = await tx.withdrawalRequest.findFirst({
        where: {
          userId: session.userId,
          status: "PENDING",
        },
      });

      if (pending) {
        throw new Error("You already have a pending request");
      }

      // ✅ CREATE WITHDRAWAL
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId: session.userId,
          amount: amountInPaise,
          method,
          upiId,
          upiName,
          giftCardType: giftType,
          status: "PENDING",
        },
      });

      // 💰 DEDUCT BALANCE
      await tx.wallet.update({
        where: { userId: session.userId },
        data: {
          availableBalance: {
            decrement: amountInPaise,
          },
        },
      });

      // 📊 WALLET LEDGER ENTRY (IMPORTANT)
      await tx.walletLedger.create({
        data: {
          userId: session.userId,
          walletId: wallet.id,
          entryType: "WITHDRAWAL_REQUEST",
          amount: amountInPaise,
          status: "COMPLETED",
          description: "Withdrawal request created",
          referenceType: "WITHDRAWAL_REQUEST",
          referenceId: withdrawal.id,
        },
      });

      // 💾 SAVE USER UPI (optional but good UX)
      if (upiId && upiName) {
        await tx.user.update({
          where: { id: session.userId },
          data: {
            upiId,
            upiName,
          },
        });
      }

      return withdrawal;
    });

    return Response.json({
      success: true,
      withdrawalId: result.id,
    });

  } catch (err: any) {
    console.error("WITHDRAW ERROR:", err);

    return Response.json(
      { error: err.message || "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}