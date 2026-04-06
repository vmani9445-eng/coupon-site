import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const storeName = String(formData.get("storeName") || "").trim();
  const storeSlug = String(formData.get("storeSlug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const discount = String(formData.get("discount") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const affiliateUrl = String(formData.get("affiliateUrl") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const submitter = String(formData.get("submitter") || "").trim();

  if (!storeName || !title) {
    return NextResponse.json(
      { error: "Store name and title are required." },
      { status: 400 }
    );
  }

  await prisma.couponSubmission.create({
    data: {
      storeName,
      storeSlug: storeSlug || null,
      title,
      discount: discount || null,
      code: code || null,
      category: category || null,
      affiliateUrl: affiliateUrl || null,
      description: description || null,
      submitter: submitter || null,
    },
  });

  return NextResponse.redirect(new URL("/submit?success=1", request.url));
}