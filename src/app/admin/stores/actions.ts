"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
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

function normalizeLogoPath(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function sanitizeFileName(fileName: string) {
  const originalExt = path.extname(fileName).toLowerCase();
  const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
  const ext = allowedExts.includes(originalExt) ? originalExt : ".png";

  const base = path.basename(fileName, path.extname(fileName));

  const safeBase = base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${safeBase || "store-logo"}-${randomUUID()}${ext}`;
}

async function saveUploadedFile(file: File, folder: string) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  const safeFileName = sanitizeFileName(file.name);
  const absolutePath = path.join(uploadDir, safeFileName);

  await writeFile(absolutePath, buffer);

  return `/${folder}/${safeFileName}`;
}

function revalidateStorePaths(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/admin/stores");

  if (slug) {
    revalidatePath(`/stores/${slug}`);
  }
}

export async function createStore(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const websiteUrl = String(formData.get("websiteUrl") || "").trim();
    const logo = normalizeLogoPath(String(formData.get("logo") || ""));
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";
    const logoFile = formData.get("logoFile");

    if (!name) {
      return { ok: false, error: "Store name is required." };
    }

    const slug = makeSlug(name);

    const existing = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: "A store with this slug already exists." };
    }

    let finalLogo = logo;

    if (logoFile instanceof File && logoFile.size > 0) {
      finalLogo = await saveUploadedFile(logoFile, "uploads/stores");
    }

    const created = await prisma.store.create({
      data: {
        name,
        slug,
        description: description || null,
        websiteUrl: websiteUrl || null,
        logo: finalLogo,
        isFeatured,
        isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    });

    revalidateStorePaths(created.slug);

    return { ok: true, store: created };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to create store.",
    };
  }
}

export async function updateStore(formData: FormData) {
  try {
    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const websiteUrl = String(formData.get("websiteUrl") || "").trim();
    const logo = normalizeLogoPath(String(formData.get("logo") || ""));
    const currentLogo = normalizeLogoPath(
      String(formData.get("currentLogo") || "")
    );
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";
    const logoFile = formData.get("logoFile");

    if (!id) {
      return { ok: false, error: "Store ID is required." };
    }

    if (!name) {
      return { ok: false, error: "Store name is required." };
    }

    const existingStore = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        logo: true,
      },
    });

    if (!existingStore) {
      return { ok: false, error: "Store not found." };
    }

    const slug = makeSlug(name);

    const conflictingStore = await prisma.store.findFirst({
      where: {
        slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (conflictingStore) {
      return { ok: false, error: "Another store already uses this slug." };
    }

    let finalLogo = logo || currentLogo || existingStore.logo || null;

    if (logoFile instanceof File && logoFile.size > 0) {
      finalLogo = await saveUploadedFile(logoFile, "uploads/stores");
    }

    const updated = await prisma.store.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        websiteUrl: websiteUrl || null,
        logo: finalLogo,
        isFeatured,
        isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    });

    revalidateStorePaths(existingStore.slug);
    revalidateStorePaths(updated.slug);

    return { ok: true, store: updated };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to update store.",
    };
  }
}

export async function deleteStore(formData: FormData) {
  try {
    const id = String(formData.get("id") || "").trim();

    if (!id) {
      return { ok: false, error: "Store ID is required." };
    }

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        slug: true,
        _count: {
          select: {
            coupons: true,
            cashbackOffers: true,
          },
        },
      },
    });

    if (!store) {
      return { ok: false, error: "Store not found." };
    }

    if (store._count.coupons > 0 || store._count.cashbackOffers > 0) {
      return {
        ok: false,
        error: "Cannot delete a store that still has coupons or cashback offers.",
      };
    }

    await prisma.store.delete({
      where: { id },
    });

    revalidateStorePaths(store.slug);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to delete store.",
    };
  }
}