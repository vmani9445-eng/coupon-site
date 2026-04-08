  import { prisma } from "@/lib/prisma";
import Home from "./homeClient";

export default async function Page() {
  const now = new Date();

  const banners = await prisma.promoBanner.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const heroTopBanners = banners.filter(
    (banner) => banner.placement === "homepage_top"
  );

  const getBanner = (placement: string) =>
    banners.find((banner) => banner.placement === placement) ?? null;

  return (
    <Home
      heroTopBanners={heroTopBanners}
      homepageTopRightTopBanner={getBanner("homepage_top_right_top")}
      homepageTopRightBottomBanner={getBanner("homepage_top_right_bottom")}
      homepageMiddleStripBanner={getBanner("homepage_middle_strip")}
      homepageLowerBoxBanner={getBanner("homepage_lower_box")}
    />
  );
}