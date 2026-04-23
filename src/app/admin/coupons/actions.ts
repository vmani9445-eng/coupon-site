"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function splitTerms(value: string) {
  return value
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugifyCategory(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCoupon(formData: FormData) {
  const storeId = String(formData.get("storeId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const discount = String(formData.get("discount") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const bank = String(formData.get("bank") || "").trim();
  const affiliateUrl = String(formData.get("affiliateUrl") || "").trim();
  const usesToday = Number(formData.get("usesToday") || 0);
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
  const termsRaw = String(formData.get("terms") || "").trim();

  const verified = formData.get("verified") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  if (!storeId || !title) {
    return { ok: false, error: "Store and title are required." };
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, slug: true },
  });

  if (!store) {
    return { ok: false, error: "Store not found." };
  }

  const categorySlug = category ? slugifyCategory(category) : "";

  await prisma.coupon.create({
    data: {
      store: {
        connect: { id: store.id },
      },
      source: "manual",
      title,
      description: description || null,
      code: code || null,
      discount: discount || null,
      category: category
        ? {
            connectOrCreate: {
              where: { slug: categorySlug },
              create: {
                name: category,
                slug: categorySlug,
              },
            },
          }
        : undefined,
      bank: bank || null,
      affiliateUrl: affiliateUrl || null,
      usesToday: Number.isFinite(usesToday) ? usesToday : 0,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      verified,
      isFeatured,
      isActive: true,
      status: "PUBLISHED",
      terms: termsRaw ? splitTerms(termsRaw) : Prisma.JsonNull,
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/stores");
  revalidatePath(`/stores/${store.slug}`);

  return { ok: true };
}