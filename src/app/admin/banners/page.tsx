import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BannersPageClient from "./BannersPageClient";

export default async function BannersPage() {
  const banners = await prisma.promoBanner.findMany({
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      imageUrl: true,
      mobileImageUrl: true,
      ctaText: true,
      ctaUrl: true,
      bannerType: true,
      placement: true,
      storeSlug: true,
      category: true,
      source: true,
      externalId: true,
      priority: true,
      isActive: true,
    },
  });

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Banners</h1>
          <p>Manage homepage and promotional banners.</p>
        </div>

        <div className="adminPageHeaderActions">
          <Link href="/admin" className="adminButton adminButtonSecondary">
            Dashboard
          </Link>
          <Link href="/admin/banners/new" className="adminButton">
            Add Banner
          </Link>
        </div>
      </div>

      <BannersPageClient banners={banners} />
    </div>
  );
}