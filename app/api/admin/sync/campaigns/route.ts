import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAdmitadCampaigns } from "@/lib/affiliate/admitad";
import {
  buildCashbackLabel,
  splitCashback,
  slugify,
} from "@/lib/affiliate/helpers";

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const urlSecret = req.nextUrl.searchParams.get("secret");

  return (
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    urlSecret === process.env.CRON_SECRET
  );
}

async function getOrCreateCategory(name: string) {
  const cleanName = name.trim() || "General";
  const slug = slugify(cleanName);

  let category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: cleanName,
        slug,
      },
    });
  }

  return category;
}

type UnifiedCampaign = {
  source: "admitad";
  externalId: string;
  name: string;
  slug: string;
  logo: string | null;
  websiteUrl: string | null;
  affiliateUrl: string | null;
  description: string | null;
  category: string;
  payoutKind: "PERCENT" | "FLAT" | null;
  networkPayoutValue: number | null;
  cashbackAllowed: boolean;
};

function isValidCampaign(campaign: UnifiedCampaign) {
  if (!campaign.name?.trim()) return false;
  if (!campaign.externalId?.trim()) return false;
  if (!campaign.slug?.trim()) return false;
  if (!campaign.affiliateUrl && !campaign.websiteUrl) return false;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dryRun = req.nextUrl.searchParams.get("dryRun") === "true";

    const admitad = await fetchAdmitadCampaigns();
    const campaigns: UnifiedCampaign[] = admitad.filter(isValidCampaign);

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        total: campaigns.length,
        preview: campaigns.slice(0, 20).map((campaign) => ({
          source: campaign.source,
          externalId: campaign.externalId,
          name: campaign.name,
          slug: campaign.slug,
          category: campaign.category,
          payoutKind: campaign.payoutKind,
          networkPayoutValue: campaign.networkPayoutValue,
          cashbackAllowed: campaign.cashbackAllowed,
          affiliateUrl: campaign.affiliateUrl,
          websiteUrl: campaign.websiteUrl,
          logo: campaign.logo,
        })),
      });
    }

    let storesCreated = 0;
    let storesUpdated = 0;
    let cashbackOffersCreated = 0;
    let cashbackOffersUpdated = 0;
    let couponsUpdated = 0;
    let skipped = 0;

    for (const campaign of campaigns) {
      try {
        const category = await getOrCreateCategory(campaign.category);

        let store = await prisma.store.findUnique({
          where: { slug: campaign.slug },
        });

        if (!store) {
          store = await prisma.store.create({
            data: {
              name: campaign.name,
              slug: campaign.slug,
              description:
                campaign.description || `${campaign.name} deals & cashback`,
              logo: campaign.logo,
              websiteUrl: campaign.websiteUrl,
              isActive: true,
            },
          });
          storesCreated++;
        } else {
          store = await prisma.store.update({
            where: { id: store.id },
            data: {
              name: campaign.name,
              description: campaign.description || store.description,
              logo: store.logo || campaign.logo,
              websiteUrl: store.websiteUrl || campaign.websiteUrl,
              isActive: true,
            },
          });
          storesUpdated++;
        }

        const userPercent = store.cashbackPercentToUser ?? 70;

        const { userCashback, adminMargin } = splitCashback(
          campaign.networkPayoutValue,
          userPercent
        );

        const cashbackLabel =
          campaign.cashbackAllowed && campaign.payoutKind
            ? buildCashbackLabel(campaign.payoutKind, userCashback)
            : null;

        const existingCashbackOffer = await prisma.cashbackOffer.findUnique({
          where: {
            cashback_source_externalId: {
              source: campaign.source,
              externalId: campaign.externalId,
            },
          },
        });

        await prisma.cashbackOffer.upsert({
          where: {
            cashback_source_externalId: {
              source: campaign.source,
              externalId: campaign.externalId,
            },
          },
          update: {
            title: `${campaign.name} Cashback`,
            description:
              campaign.description || `${campaign.name} cashback offer`,
            cashbackType: campaign.payoutKind === "FLAT" ? "FLAT" : "PERCENT",
            cashbackValue: campaign.networkPayoutValue ?? 0,
            affiliateUrl: campaign.affiliateUrl || campaign.websiteUrl || "#",
            storeId: store.id,
            networkCashback: campaign.networkPayoutValue,
            userCashback: campaign.cashbackAllowed ? userCashback : null,
            adminMargin: campaign.cashbackAllowed ? adminMargin : null,
            cashbackLabel,
            isActive: true,
            rawPayload: campaign as any,
          },
          create: {
            source: campaign.source,
            externalId: campaign.externalId,
            title: `${campaign.name} Cashback`,
            description:
              campaign.description || `${campaign.name} cashback offer`,
            cashbackType: campaign.payoutKind === "FLAT" ? "FLAT" : "PERCENT",
            cashbackValue: campaign.networkPayoutValue ?? 0,
            affiliateUrl: campaign.affiliateUrl || campaign.websiteUrl || "#",
            storeId: store.id,
            networkCashback: campaign.networkPayoutValue,
            userCashback: campaign.cashbackAllowed ? userCashback : null,
            adminMargin: campaign.cashbackAllowed ? adminMargin : null,
            cashbackLabel,
            isActive: true,
            rawPayload: campaign as any,
          },
        });

        if (existingCashbackOffer) cashbackOffersUpdated++;
        else cashbackOffersCreated++;

        const couponUpdateResult = await prisma.coupon.updateMany({
          where: {
            storeId: store.id,
            isActive: true,
          },
          data: {
            categoryId: category.id,
            networkCashback: campaign.networkPayoutValue,
            userCashback: campaign.cashbackAllowed ? userCashback : null,
            adminMargin: campaign.cashbackAllowed ? adminMargin : null,
            cashbackLabel,
          },
        });

        couponsUpdated += couponUpdateResult.count;
      } catch (campaignError) {
        skipped++;
        console.error("CAMPAIGN_SYNC_ITEM_ERROR", {
          campaign: {
            source: campaign.source,
            externalId: campaign.externalId,
            name: campaign.name,
          },
          error: campaignError,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      total: campaigns.length,
      storesCreated,
      storesUpdated,
      cashbackOffersCreated,
      cashbackOffersUpdated,
      couponsUpdated,
      skipped,
    });
  } catch (error: any) {
    console.error("CAMPAIGN_SYNC_ERROR", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Sync failed" },
      { status: 500 }
    );
  }
}