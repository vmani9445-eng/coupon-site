import { prisma } from "@/lib/prisma";

type ImportCoupon = {
  source: string;
  externalId?: string;
  storeName: string;
  title: string;
  description?: string;
  code?: string;
  discount?: string;
  category?: string;
  affiliateUrl: string;
  expiresAt?: Date | null;
  rawPayload?: unknown;
};

type ImportCashback = {
  source: string;
  externalId?: string;
  storeName: string;
  title: string;
  description?: string;
  cashbackType: "percent" | "flat";
  cashbackValue: number;
  affiliateUrl: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
  terms?: string;
  rawPayload?: unknown;
};

async function getOrCreateStore(storeName: string) {
  const slug = storeName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return prisma.store.upsert({
    where: { slug },
    update: { name: storeName },
    create: {
      name: storeName,
      slug,
      isActive: true,
    },
  });
}

export async function upsertImportedCoupons(items: ImportCoupon[]) {
  for (const item of items) {
    const store = await getOrCreateStore(item.storeName);

    if (item.externalId) {
      await prisma.coupon.upsert({
        where: {
          source_externalId: {
            source: item.source,
            externalId: item.externalId,
          },
        },
        update: {
          storeId: store.id,
          title: item.title,
          description: item.description,
          code: item.code,
          discount: item.discount,
          category: item.category,
          affiliateUrl: item.affiliateUrl,
          expiresAt: item.expiresAt ?? null,
          rawPayload: item.rawPayload as any,
          isActive: true,
        },
        create: {
          storeId: store.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          code: item.code,
          discount: item.discount,
          category: item.category,
          affiliateUrl: item.affiliateUrl,
          expiresAt: item.expiresAt ?? null,
          rawPayload: item.rawPayload as any,
          isActive: true,
        },
      });
    }
  }
}

export async function upsertImportedCashback(items: ImportCashback[]) {
  for (const item of items) {
    const store = await getOrCreateStore(item.storeName);

    if (item.externalId) {
      await prisma.cashbackOffer.upsert({
        where: {
          source_externalId: {
            source: item.source,
            externalId: item.externalId,
          },
        },
        update: {
          storeId: store.id,
          title: item.title,
          description: item.description,
          cashbackType: item.cashbackType,
          cashbackValue: item.cashbackValue,
          affiliateUrl: item.affiliateUrl,
          startsAt: item.startsAt ?? null,
          endsAt: item.endsAt ?? null,
          terms: item.terms,
          rawPayload: item.rawPayload as any,
          isActive: true,
        },
        create: {
          storeId: store.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          cashbackType: item.cashbackType,
          cashbackValue: item.cashbackValue,
          affiliateUrl: item.affiliateUrl,
          startsAt: item.startsAt ?? null,
          endsAt: item.endsAt ?? null,
          terms: item.terms,
          rawPayload: item.rawPayload as any,
          isActive: true,
        },
      });
    }
  }
}