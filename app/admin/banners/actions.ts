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

function toNullableDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

export async function createBanner(formData: FormData) {
  const title = toNullableString(formData.get("title"));
  const subtitle = toNullableString(formData.get("subtitle"));
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
  const startsAt = toNullableDate(formData.get("startsAt"));
  const endsAt = toNullableDate(formData.get("endsAt"));

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!bannerType) {
    throw new Error("Banner type is required.");
  }

  if (!placement) {
    throw new Error("Placement is required.");
  }

  let imageUrl = manualImageUrl;
  let mobileImageUrl = manualMobileImageUrl;

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedFile(imageFile, "uploads/banners");
  }

  if (mobileImageFile instanceof File && mobileImageFile.size > 0) {
    mobileImageUrl = await saveUploadedFile(mobileImageFile, "uploads/banners");
  }

  if (!imageUrl) {
    throw new Error(
      "Main banner image is required. Upload a file or enter an image URL."
    );
  }

  await prisma.promoBanner.create({
    data: {
      title,
      subtitle,
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
      startsAt,
      endsAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/banners");

  redirect("/admin/banners");
}