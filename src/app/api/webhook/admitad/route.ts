import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CashbackStatus,
  LedgerReferenceType,
  WalletEntryType,
  ClickStatus,
} from "@prisma/client";

const SOURCE = "admitad";

type ParsedWebhook = {
  trackingCode: string | null;
  externalOrderId: string | null;
  status: CashbackStatus;
  orderAmount: number;
  commissionAmount: number;
  rawStatus: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = await parseIncomingBody(req);
    const parsed = parseWebhookPayload(body);

    if (!parsed.trackingCode) {
      return NextResponse.json(
        { ok: false, error: "Missing tracking code" },
        { status: 400 }
      );
    }

    const clickLog = await prisma.clickLog.findUnique({
      where: { trackingCode: parsed.trackingCode },
      include: {
        store: true,
        coupon: true,
        cashback: true,
        user: true,
      },
    });

    if (!clickLog) {
      return NextResponse.json(
        { ok: false, error: "Click log not found" },
        { status: 404 }
      );
    }

    if (!clickLog.userId) {
      return NextResponse.json(
        { ok: false, error: "Click log is not linked to a user" },
        { status: 400 }
      );
    }

    const userId = clickLog.userId;

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await getOrCreateWallet(tx, userId);

      const cashbackPercent =
        typeof clickLog.store?.cashbackPercentToUser === "number"
          ? clickLog.store.cashbackPercentToUser
          : 70;

      const cashbackAmount = Math.max(
        0,
        Math.round((parsed.commissionAmount * cashbackPercent) / 100)
      );

      const platformMarginAmount = Math.max(
        0,
        parsed.commissionAmount - cashbackAmount
      );

      const existingConditions = [];

      if (parsed.externalOrderId) {
        existingConditions.push({
          source: SOURCE,
          externalOrderId: parsed.externalOrderId,
        });
      }

      if (parsed.trackingCode) {
        existingConditions.push({
          source: SOURCE,
          externalTrackingId: parsed.trackingCode,
        });
      }

      const existing =
        existingConditions.length > 0
          ? await tx.cashbackTransaction.findFirst({
              where: {
                OR: existingConditions,
              },
            })
          : null;

      const previousStatus = existing?.status ?? null;

      let cashbackTransaction;

      if (existing) {
        cashbackTransaction = await tx.cashbackTransaction.update({
          where: { id: existing.id },
          data: {
            userId,
            walletId: wallet.id,
            clickLogId: clickLog.id,
            storeId: clickLog.storeId,
            couponId: clickLog.couponId,
            cashbackOfferId: clickLog.cashbackId,
            source: SOURCE,
            externalOrderId:
              parsed.externalOrderId ?? existing.externalOrderId ?? null,
            externalTrackingId: parsed.trackingCode,
            orderAmount: parsed.orderAmount,
            commissionAmount: parsed.commissionAmount,
            cashbackAmount,
            platformMarginAmount,
            status: parsed.status,
            trackedAt: existing.trackedAt ?? new Date(),
            confirmedAt: setDateIfStatus(parsed.status, CashbackStatus.CONFIRMED),
            payableAt: setDateIfStatus(parsed.status, CashbackStatus.PAYABLE),
            paidAt: setDateIfStatus(parsed.status, CashbackStatus.PAID),
            rejectedAt: setDateIfStatus(parsed.status, CashbackStatus.REJECTED),
            rejectionReason:
              parsed.status === CashbackStatus.REJECTED
                ? parsed.rawStatus || "Rejected by network"
                : null,
          },
        });
      } else {
        cashbackTransaction = await tx.cashbackTransaction.create({
          data: {
            userId,
            walletId: wallet.id,
            clickLogId: clickLog.id,
            storeId: clickLog.storeId,
            couponId: clickLog.couponId,
            cashbackOfferId: clickLog.cashbackId,
            source: SOURCE,
            externalOrderId: parsed.externalOrderId,
            externalTrackingId: parsed.trackingCode,
            orderAmount: parsed.orderAmount,
            commissionAmount: parsed.commissionAmount,
            cashbackAmount,
            platformMarginAmount,
            status: parsed.status,
            trackedAt: new Date(),
            confirmedAt: setDateIfStatus(parsed.status, CashbackStatus.CONFIRMED),
            payableAt: setDateIfStatus(parsed.status, CashbackStatus.PAYABLE),
            paidAt: setDateIfStatus(parsed.status, CashbackStatus.PAID),
            rejectedAt: setDateIfStatus(parsed.status, CashbackStatus.REJECTED),
            rejectionReason:
              parsed.status === CashbackStatus.REJECTED
                ? parsed.rawStatus || "Rejected by network"
                : null,
          },
        });
      }

      if (!previousStatus || previousStatus !== parsed.status) {
        await applyWalletStatusTransition(
          tx,
          wallet.id,
          userId,
          previousStatus,
          parsed.status,
          cashbackAmount,
          cashbackTransaction.id
        );
      }

      await tx.clickLog.update({
        where: { id: clickLog.id },
        data: {
          status: mapClickStatus(parsed.status),
        },
      });

      return cashbackTransaction;
    });

    return NextResponse.json({
      ok: true,
      transactionId: result.id,
      trackingCode: parsed.trackingCode,
      orderId: parsed.externalOrderId,
      status: parsed.status,
    });
  } catch (error) {
    console.error("ADMITAD_WEBHOOK_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Webhook failed",
      },
      { status: 500 }
    );
  }
}

async function parseIncomingBody(
  req: NextRequest
): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await req.json().catch(() => ({}))) as Record<string, unknown>;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }

  const text = await req.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }
}

function parseWebhookPayload(body: Record<string, unknown>): ParsedWebhook {
  const trackingCode = firstString(
    body.subid,
    body.sub_id,
    body.clickref,
    body.click_ref,
    body.aff_sub,
    body.aff_sub1,
    body.advcampaign_id,
    body.uid,
    body.sub1,
    body.sub2,
    body.trackingCode
  );

  const externalOrderId = firstString(
    body.order_id,
    body.orderId,
    body.transaction_id,
    body.action_id,
    body.sale_id,
    body.txn_id
  );

  const rawStatus = firstString(
    body.status,
    body.action_status,
    body.order_status,
    body.sale_status,
    body.txn_status
  );

  const commissionAmount = toPaise(
    firstNumberLike(
      body.commission,
      body.commission_amount,
      body.payment,
      body.payout,
      body.reward,
      body.earning
    )
  );

  const orderAmount = toPaise(
    firstNumberLike(
      body.order_amount,
      body.cart,
      body.sale_amount,
      body.total,
      body.amount
    )
  );

  return {
    trackingCode,
    externalOrderId,
    rawStatus,
    commissionAmount,
    orderAmount,
    status: normalizeCashbackStatus(rawStatus),
  };
}

function normalizeCashbackStatus(value: string | null): CashbackStatus {
  const v = (value || "").trim().toLowerCase();

  if (
    v === "pending" ||
    v === "initiated" ||
    v === "tracked" ||
    v === "tracking" ||
    v === "new" ||
    v === "hold"
  ) {
    return CashbackStatus.PENDING;
  }

  if (v === "confirmed" || v === "approved" || v === "success") {
    return CashbackStatus.CONFIRMED;
  }

  if (v === "payable") {
    return CashbackStatus.PAYABLE;
  }

  if (v === "paid") {
    return CashbackStatus.PAID;
  }

  if (
    v === "rejected" ||
    v === "cancelled" ||
    v === "declined" ||
    v === "failed"
  ) {
    return CashbackStatus.REJECTED;
  }

  return CashbackStatus.PENDING;
}

function mapClickStatus(status: CashbackStatus): ClickStatus {
  switch (status) {
    case CashbackStatus.REJECTED:
      return ClickStatus.REJECTED;
    case CashbackStatus.CONFIRMED:
    case CashbackStatus.PAYABLE:
      return ClickStatus.CONFIRMED;
    case CashbackStatus.PAID:
      return ClickStatus.PAID;
    case CashbackStatus.PENDING:
    case CashbackStatus.TRACKING:
    default:
      return ClickStatus.TRACKED;
  }
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function firstNumberLike(...values: unknown[]): number {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function toPaise(value: number): number {
  return Math.max(0, Math.round(value * 100));
}

function setDateIfStatus(
  status: CashbackStatus,
  target: CashbackStatus
) {
  return status === target ? new Date() : undefined;
}

async function getOrCreateWallet(tx: any, userId: string) {
  const existing = await tx.wallet.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return tx.wallet.create({
    data: {
      userId,
      pendingBalance: 0,
      confirmedBalance: 0,
      availableBalance: 0,
      lifetimeEarned: 0,
      lifetimeWithdrawn: 0,
      lifetimeRejected: 0,
    },
  });
}

async function applyWalletStatusTransition(
  tx: any,
  walletId: string,
  userId: string,
  previousStatus: CashbackStatus | null,
  nextStatus: CashbackStatus,
  amount: number,
  cashbackTransactionId: string
) {
  const remove = walletEffect(previousStatus, amount);
  const add = walletEffect(nextStatus, amount);

  await tx.wallet.update({
    where: { id: walletId },
    data: {
      pendingBalance: { increment: add.pending - remove.pending },
      confirmedBalance: { increment: add.confirmed - remove.confirmed },
      availableBalance: { increment: add.available - remove.available },
      lifetimeEarned: { increment: add.earned - remove.earned },
      lifetimeRejected: { increment: add.rejected - remove.rejected },
    },
  });

  if (previousStatus !== nextStatus) {
    await tx.walletLedger.create({
      data: {
        userId,
        walletId,
        entryType: mapLedgerEntryType(nextStatus),
        amount,
        status: "COMPLETED",
        description: `Cashback ${nextStatus.toLowerCase()} from webhook`,
        referenceType: LedgerReferenceType.CASHBACK_TRANSACTION,
        referenceId: cashbackTransactionId,
      },
    });
  }
}

function walletEffect(status: CashbackStatus | null, amount: number) {
  if (!status) {
    return {
      pending: 0,
      confirmed: 0,
      available: 0,
      earned: 0,
      rejected: 0,
    };
  }

  switch (status) {
    case CashbackStatus.TRACKING:
    case CashbackStatus.PENDING:
      return {
        pending: amount,
        confirmed: 0,
        available: 0,
        earned: 0,
        rejected: 0,
      };

    case CashbackStatus.CONFIRMED:
      return {
        pending: 0,
        confirmed: amount,
        available: 0,
        earned: amount,
        rejected: 0,
      };

    case CashbackStatus.PAYABLE:
    case CashbackStatus.PAID:
      return {
        pending: 0,
        confirmed: amount,
        available: amount,
        earned: amount,
        rejected: 0,
      };

    case CashbackStatus.REJECTED:
      return {
        pending: 0,
        confirmed: 0,
        available: 0,
        earned: 0,
        rejected: amount,
      };

    default:
      return {
        pending: 0,
        confirmed: 0,
        available: 0,
        earned: 0,
        rejected: 0,
      };
  }
}

function mapLedgerEntryType(status: CashbackStatus): WalletEntryType {
  switch (status) {
    case CashbackStatus.CONFIRMED:
    case CashbackStatus.PAYABLE:
    case CashbackStatus.PAID:
      return WalletEntryType.CASHBACK_CONFIRMED;
    case CashbackStatus.REJECTED:
      return WalletEntryType.CASHBACK_REJECTED;
    case CashbackStatus.TRACKING:
    case CashbackStatus.PENDING:
    default:
      return WalletEntryType.CASHBACK_PENDING;
  }
}