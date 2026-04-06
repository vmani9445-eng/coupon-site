"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function splitTerms(value: string) {
  return value
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
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
    select: { slug: true },
  });

  if (!store) {
    return { ok: false, error: "Store not found." };
  }

  await prisma.coupon.create({
    data: {
      storeId,
      source: "manual",
      title,
      description: description || null,
      code: code || null, // if null → becomes DEAL
      discount: discount || null,
      category: category || null,
      bank: bank || null,
      affiliateUrl: affiliateUrl || null,
      usesToday: Number.isFinite(usesToday) ? usesToday : 0,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      verified,
      isFeatured,
      isActive: true,
      status: "PUBLISHED",
      terms: termsRaw ? splitTerms(termsRaw) : null,
    },
  });

  // refresh pages
  revalidatePath("/admin/coupons");
  revalidatePath("/stores");
  revalidatePath(`/stores/${store.slug}`);

  return { ok: true };
}