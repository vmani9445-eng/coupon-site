"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function toNullableDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? new Date(text) : null;
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
  const category = toNullableString(formData.get("category"));

  if (!storeId) {
    return { ok: false, error: "Store is required." };
  }

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  await prisma.coupon.create({
    data: {
      store: {
        connect: { id: storeId },
      },
      source: "manual",
      title,
      description: toNullableString(formData.get("description")),
      code: toNullableString(formData.get("code")),
      discount: toNullableString(formData.get("discount")),
      category: category
        ? {
            connectOrCreate: {
              where: { slug: slugifyCategory(category) },
              create: {
                name: category,
                slug: slugifyCategory(category),
              },
            },
          }
        : undefined,
      bank: toNullableString(formData.get("bank")),
      affiliateUrl: toNullableString(formData.get("affiliateUrl")),
      expiresAt: toNullableDate(formData.get("expiresAt")),
      verified: true,
      isFeatured: toBoolean(formData.get("isFeatured")),
      isActive: toBoolean(formData.get("isActive")),
      status: "PUBLISHED",
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  revalidatePath("/stores");

  return { ok: true };
}

export async function updateCoupon(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const storeId = String(formData.get("storeId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const category = toNullableString(formData.get("category"));

  if (!id) {
    return { ok: false, error: "Coupon ID is required." };
  }

  if (!storeId) {
    return { ok: false, error: "Store is required." };
  }

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  await prisma.coupon.update({
    where: { id },
    data: {
      store: {
        connect: { id: storeId },
      },
      title,
      description: toNullableString(formData.get("description")),
      code: toNullableString(formData.get("code")),
      discount: toNullableString(formData.get("discount")),
      category: category
        ? {
            connectOrCreate: {
              where: { slug: slugifyCategory(category) },
              create: {
                name: category,
                slug: slugifyCategory(category),
              },
            },
          }
        : {
            disconnect: true,
          },
      bank: toNullableString(formData.get("bank")),
      affiliateUrl: toNullableString(formData.get("affiliateUrl")),
      expiresAt: toNullableDate(formData.get("expiresAt")),
      isFeatured: toBoolean(formData.get("isFeatured")),
      isActive: toBoolean(formData.get("isActive")),
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  revalidatePath("/stores");

  return { ok: true };
}

export async function deleteCoupon(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return { ok: false, error: "Coupon ID is required." };
  }

  await prisma.coupon.delete({
    where: { id },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  revalidatePath("/stores");

  return { ok: true };
}