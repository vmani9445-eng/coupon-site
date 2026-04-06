"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createStore(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const websiteUrl = String(formData.get("websiteUrl") || "").trim();
  const logo = String(formData.get("logo") || "").trim();
  const isFeatured = formData.get("isFeatured") === "on";

  if (!name) {
    return { ok: false, error: "Store name is required." };
  }

  const slug = makeSlug(name);

  const existing = await prisma.store.findFirst({
    where: { slug },
  });

  if (existing) {
    return { ok: false, error: "A store with this slug already exists." };
  }

  await prisma.store.create({
    data: {
      name,
      slug,
      description: description || null,
      websiteUrl: websiteUrl || null,
      logo: logo || null,
      isFeatured,
    },
  });

  revalidatePath("/admin/stores");
  revalidatePath("/stores");

  return { ok: true };
}

export async function updateStore(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const websiteUrl = String(formData.get("websiteUrl") || "").trim();
  const logo = String(formData.get("logo") || "").trim();
  const isFeatured = formData.get("isFeatured") === "on";

  if (!id) {
    return { ok: false, error: "Store ID is required." };
  }

  if (!name) {
    return { ok: false, error: "Store name is required." };
  }

  const slug = makeSlug(name);

  const existing = await prisma.store.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });

  if (existing) {
    return { ok: false, error: "Another store already uses this slug." };
  }

  await prisma.store.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
      websiteUrl: websiteUrl || null,
      logo: logo || null,
      isFeatured,
    },
  });

  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath(`/stores/${slug}`);

  return { ok: true };
}

export async function deleteStore(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return { ok: false, error: "Store ID is required." };
  }

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          coupons: true,
          cashback: true,
        },
      },
    },
  });

  if (!store) {
    return { ok: false, error: "Store not found." };
  }

  if (store._count.coupons > 0 || store._count.cashback > 0) {
    return {
      ok: false,
      error: "Cannot delete a store that still has coupons or cashback offers.",
    };
  }

  await prisma.store.delete({
    where: { id },
  });

  revalidatePath("/admin/stores");
  revalidatePath("/stores");

  return { ok: true };
}