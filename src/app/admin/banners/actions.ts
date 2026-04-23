"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${safeBase || "banner"}-${randomUUID()}${ext}`;
}

async function saveUploadedFile(file: File, folder: string) {
  if (!(file instanceof File) || file.size === 0) return null;

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

function buildInternalTitle({
  placement,
  bannerType,
}: {
  placement: string | null;
  bannerType: string | null;
}) {
  return `${placement || "banner"}-${bannerType || "image"}-${randomUUID().slice(0, 8)}`;
}

export async function createBanner(formData: FormData) {
  const manualImageUrl = toNullableString(formData.get("imageUrl"));
  const manualMobileImageUrl = toNullableString(formData.get("mobileImageUrl"));
  const imageFile = formData.get("imageFile");
  const mobileImageFile = formData.get("mobileImageFile");

  const ctaText = toNullableString(formData.get("ctaText"));
  const ctaUrl = toNullableString(formData.get("ctaUrl"));
  const bannerType = toNullableString(formData.get("bannerType"));
  const placement = toNullableString(formData.get("placement"));
  const storeSlug = toNullableString(formData.get("storeSlug"));
  const category = toNullableString(formData.get("category"));
  const source = toNullableString(formData.get("source")) ?? "manual";
  const externalId = toNullableString(formData.get("externalId"));
  const priority = toNumber(formData.get("priority"), 0);
  const isActive = toBoolean(formData.get("isActive"));

  if (!bannerType) throw new Error("Banner type is required.");
  if (!placement) throw new Error("Placement is required.");

  let imageUrl = manualImageUrl;
  let mobileImageUrl = manualMobileImageUrl;

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedFile(imageFile, "uploads/banners");
  }

  if (mobileImageFile instanceof File && mobileImageFile.size > 0) {
    mobileImageUrl = await saveUploadedFile(mobileImageFile, "uploads/banners");
  }

  if (!imageUrl) {
    throw new Error("Banner image is required.");
  }

  await prisma.promoBanner.create({
    data: {
      title: buildInternalTitle({ placement, bannerType }),
      subtitle: null,
      imageUrl,
      mobileImageUrl,
      ctaText,
      ctaUrl,
      bannerType,
      placement,
      storeSlug,
      category,
      source,
      externalId,
      priority,
      isActive,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBanner(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Banner ID is required.");

  const manualImageUrl = toNullableString(formData.get("imageUrl"));
  const manualMobileImageUrl = toNullableString(formData.get("mobileImageUrl"));
  const currentImageUrl = toNullableString(formData.get("currentImageUrl"));
  const currentMobileImageUrl = toNullableString(formData.get("currentMobileImageUrl"));

  const imageFile = formData.get("imageFile");
  const mobileImageFile = formData.get("mobileImageFile");

  const ctaText = toNullableString(formData.get("ctaText"));
  const ctaUrl = toNullableString(formData.get("ctaUrl"));
  const bannerType = toNullableString(formData.get("bannerType"));
  const placement = toNullableString(formData.get("placement"));
  const storeSlug = toNullableString(formData.get("storeSlug"));
  const category = toNullableString(formData.get("category"));
  const source = toNullableString(formData.get("source")) ?? "manual";
  const externalId = toNullableString(formData.get("externalId"));
  const priority = toNumber(formData.get("priority"), 0);
  const isActive = toBoolean(formData.get("isActive"));

  if (!bannerType) throw new Error("Banner type is required.");
  if (!placement) throw new Error("Placement is required.");

  let imageUrl = manualImageUrl || currentImageUrl;
  let mobileImageUrl = manualMobileImageUrl || currentMobileImageUrl;

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedFile(imageFile, "uploads/banners");
  }

  if (mobileImageFile instanceof File && mobileImageFile.size > 0) {
    mobileImageUrl = await saveUploadedFile(mobileImageFile, "uploads/banners");
  }

  if (!imageUrl) {
    throw new Error("Banner image is required.");
  }

  await prisma.promoBanner.update({
    where: { id },
    data: {
      imageUrl,
      mobileImageUrl,
      ctaText,
      ctaUrl,
      bannerType,
      placement,
      storeSlug,
      category,
      source,
      externalId,
      priority,
      isActive,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Banner ID is required.");

  await prisma.promoBanner.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function reorderBanners(items: { id: string; priority: number }[]) {
  if (!Array.isArray(items) || items.length === 0) return;

  await prisma.$transaction(
    items.map((item) =>
      prisma.promoBanner.update({
        where: { id: item.id },
        data: { priority: item.priority },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/banners");
}