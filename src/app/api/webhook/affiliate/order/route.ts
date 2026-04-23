import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toPaise(value: unknown) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num * 100));
}

function toOptionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function normalizeStoreSlug(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return null;

  return text
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const trackingCode =
      toOptionalString(body.trackingCode) ||
      toOptionalString(body.subId) ||
      toOptionalString(body.sub_id) ||
      toOptionalString(body.click_id) ||
      toOptionalString(body.aff_sub);

    const externalTrackingId =
      toOptionalString(body.externalTrackingId) ||
      toOptionalString(body.transaction_id) ||
      toOptionalString(body.tracking_id);

    const externalOrderId =
      toOptionalString(body.externalOrderId) ||
      toOptionalString(body.order_id) ||
      toOptionalString(body.orderId);

    const storeSlug =
      normalizeStoreSlug(body.storeSlug) ||
      normalizeStoreSlug(body.store_slug) ||
      normalizeStoreSlug(body.store) ||
      normalizeStoreSlug(body.advertiser);

    const orderAmount = toPaise(
      body.orderAmount || body.order_amount || body.sale_amount || 0
    );

    const commissionAmount = toPaise(
      body.commissionAmount || body.commission || body.payout || 0
    );

    if (!commissionAmount) {
      return NextResponse.json(
        { error: "Missing commission amount" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let clickLog = null;

      if (trackingCode) {
        clickLog = await tx.clickLog.findUnique({
          where: { trackingCode },
          include: {
            store: true,
            user: true,
          },
        });
      }

      const store =
        clickLog?.store ||
        (storeSlug
          ? await tx.store.findUnique({
              where: { slug: storeSlug },
            })
          : null);

      if (!store) {
        throw new Error("Store not found");
      }

      if (!clickLog?.userId) {
        throw new Error("Tracked click has no linked user");
      }

      const userId = clickLog.userId;

      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId },
        });
      }

      if (externalTrackingId) {
        const existingTxn = await tx.cashbackTransaction.findFirst({
          where: { externalTrackingId },
        });

        if (existingTxn) {
          return existingTxn;
        }
      }

      if (externalOrderId) {
        const existingOrderTxn = await tx.cashbackTransaction.findFirst({
          where: {
            externalOrderId,
            userId,
            storeId: store.id,
          },
        });

        if (existingOrderTxn) {
          return existingOrderTxn;
        }
      }

      const cashbackPercentToUser =
        typeof (store as any).cashbackPercentToUser === "number"
          ? Math.min(100, Math.max(0, (store as any).cashbackPercentToUser))
          : 70;

      const cashbackAmount = Math.floor(
        (commissionAmount * cashbackPercentToUser) / 100
      );

      const platformMarginAmount = commissionAmount - cashbackAmount;

      const purchaseAt =
        body.purchaseAt || body.purchase_at
          ? new Date(body.purchaseAt || body.purchase_at)
          : null;

      const cashbackTxn = await tx.cashbackTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          clickLogId: clickLog.id,
          storeId: store.id,
          source: "affiliate-webhook",
          externalOrderId,
          externalTrackingId: externalTrackingId || trackingCode,
          orderAmount: orderAmount || null,
          commissionAmount,
          cashbackAmount,
          platformMarginAmount,
          status: "PENDING",
          purchaseAt,
          trackedAt: new Date(),
          adminNotes: "Auto-created from affiliate tracked order webhook",
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: {
            increment: cashbackAmount,
          },
          lifetimeEarned: {
            increment: cashbackAmount,
          },
        },
      });

      await tx.walletLedger.create({
        data: {
          userId,
          walletId: wallet.id,
          entryType: "CASHBACK_PENDING",
          amount: cashbackAmount,
          status: "COMPLETED",
          description: `Pending cashback tracked for ${store.name}`,
          referenceType: "CASHBACK_TRANSACTION",
          referenceId: cashbackTxn.id,
        },
      });

      await tx.clickLog.update({
        where: { id: clickLog.id },
        data: {
          status: "TRACKED",
        },
      });

      return cashbackTxn;
    });

    return NextResponse.json({
      ok: true,
      cashbackTransactionId: result.id,
    });
  } catch (err: any) {
    console.error("AFFILIATE_ORDER_WEBHOOK_ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "failed to process tracked order" },
      { status: 500 }
    );
  }
}