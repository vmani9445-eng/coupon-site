"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleHomepageSection(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Section ID is required.");
  }

  const existing = await prisma.homepageSectionControl.findUnique({
    where: { id },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!existing) {
    throw new Error("Section not found.");
  }

  await prisma.homepageSectionControl.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });

  revalidatePath("/admin/home");
  revalidatePath("/");
}

export async function moveHomepageSection(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const direction = String(formData.get("direction") || "").trim();

  if (!id || !["up", "down"].includes(direction)) {
    throw new Error("Invalid reorder request.");
  }

  const sections = await prisma.homepageSectionControl.findMany({
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      sortOrder: true,
    },
  });

  const currentIndex = sections.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    throw new Error("Section not found.");
  }

  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (swapIndex < 0 || swapIndex >= sections.length) {
    return;
  }

  const current = sections[currentIndex];
  const target = sections[swapIndex];

  await prisma.$transaction([
    prisma.homepageSectionControl.update({
      where: { id: current.id },
      data: { sortOrder: target.sortOrder },
    }),
    prisma.homepageSectionControl.update({
      where: { id: target.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidatePath("/admin/home");
  revalidatePath("/");
}