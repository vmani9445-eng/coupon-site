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

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);

  const safeBase = base
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${safeBase || "store-logo"}-${randomUUID()}${ext}`;
}

async function saveUploadedFile(file: File, folder: string) {
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

export async function createStore(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const websiteUrl = String(formData.get("websiteUrl") || "").trim();
    const logo = String(formData.get("logo") || "").trim();
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";

    const logoFile = formData.get("logoFile");

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

    let finalLogo = logo || null;

    if (logoFile instanceof File && logoFile.size > 0) {
      finalLogo = await saveUploadedFile(logoFile, "uploads/stores");
    }

    await prisma.store.create({
      data: {
        name,
        slug,
        description: description || null,
        websiteUrl: websiteUrl || null,
        logo: finalLogo,
        isFeatured,
        isActive,
      },
    });

    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    revalidatePath("/");

    return { ok: true };
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
    const logo = String(formData.get("logo") || "").trim();
    const currentLogo = String(formData.get("currentLogo") || "").trim();
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";

    const logoFile = formData.get("logoFile");

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

    let finalLogo = logo || currentLogo || null;

    if (logoFile instanceof File && logoFile.size > 0) {
      finalLogo = await saveUploadedFile(logoFile, "uploads/stores");
    }

    await prisma.store.update({
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
    });

    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    revalidatePath("/");
    revalidatePath(`/stores/${slug}`);

    return { ok: true };
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
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to delete store.",
    };
  }
}