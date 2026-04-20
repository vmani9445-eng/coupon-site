import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const status = String(body?.status || "");
    const adminNotes = body?.adminNotes ?? null;

    if (!["APPROVED", "REJECTED", "PAID"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid withdrawal status." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id },
      });

      if (!withdrawal) {
        throw new Error("NOT_FOUND");
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId: withdrawal.userId },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (withdrawal.status === "PAID") {
        throw new Error("ALREADY_PAID");
      }

      if (withdrawal.status === "REJECTED") {
        throw new Error("ALREADY_REJECTED");
      }

      if (status === "APPROVED") {
        if (withdrawal.status !== "PENDING") {
          throw new Error("INVALID_APPROVE");
        }

        const updated = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            adminNotes,
            processedAt: new Date(),
            paidAt: null,
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: withdrawal.userId,
            walletId: wallet.id,
            entryType: "WITHDRAWAL_APPROVED",
            amount: withdrawal.amount,
            status: "COMPLETED",
            description: "Withdrawal request approved",
            referenceType: "WITHDRAWAL_REQUEST",
            referenceId: withdrawal.id,
          },
        });

        return updated;
      }

      if (status === "REJECTED") {
        if (withdrawal.status !== "PENDING" && withdrawal.status !== "APPROVED") {
          throw new Error("INVALID_REJECT");
        }

        const updated = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            adminNotes,
            processedAt: new Date(),
            paidAt: null,
          },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalance: {
              increment: withdrawal.amount,
            },
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: withdrawal.userId,
            walletId: wallet.id,
            entryType: "WITHDRAWAL_REJECTED",
            amount: withdrawal.amount,
            status: "COMPLETED",
            description: adminNotes || "Withdrawal request rejected",
            referenceType: "WITHDRAWAL_REQUEST",
            referenceId: withdrawal.id,
          },
        });

        return updated;
      }

      if (status === "PAID") {
        if (withdrawal.status !== "APPROVED") {
          throw new Error("INVALID_PAID");
        }

        const updated = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: "PAID",
            adminNotes,
            processedAt: withdrawal.processedAt ?? new Date(),
            paidAt: new Date(),
          },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            lifetimeWithdrawn: {
              increment: withdrawal.amount,
            },
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: withdrawal.userId,
            walletId: wallet.id,
            entryType: "WITHDRAWAL_PAID",
            amount: withdrawal.amount,
            status: "COMPLETED",
            description: adminNotes || "Withdrawal marked as paid",
            referenceType: "WITHDRAWAL_REQUEST",
            referenceId: withdrawal.id,
          },
        });

        return updated;
      }

      throw new Error("INVALID_STATUS");
    });

    return NextResponse.json({ withdrawal: result });
  } catch (error: any) {
    console.error("ADMIN_WITHDRAWAL_PATCH_ERROR", error);

    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (error.message === "ALREADY_PAID") {
      return NextResponse.json(
        { error: "Withdrawal already marked as paid" },
        { status: 400 }
      );
    }

    if (error.message === "ALREADY_REJECTED") {
      return NextResponse.json(
        { error: "Withdrawal already rejected" },
        { status: 400 }
      );
    }

    if (
      error.message === "INVALID_APPROVE" ||
      error.message === "INVALID_REJECT" ||
      error.message === "INVALID_PAID"
    ) {
      return NextResponse.json(
        { error: "Invalid withdrawal status transition" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update withdrawal request" },
      { status: 500 }
    );
  }
}