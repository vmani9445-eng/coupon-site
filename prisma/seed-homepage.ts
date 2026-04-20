import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sections = [
    {
      sectionKey: "hero",
      title: "Hero Banner",
      isActive: true,
      sortOrder: 1,
    },
    {
      sectionKey: "top_brands",
      title: "Top Indian Brands",
      isActive: true,
      sortOrder: 2,
    },
    {
      sectionKey: "categories",
      title: "Popular Categories",
      isActive: true,
      sortOrder: 3,
    },
    {
      sectionKey: "featured_coupons",
      title: "Featured Coupons",
      isActive: true,
      sortOrder: 4,
    },
    {
      sectionKey: "promo_row",
      title: "Promo Row",
      isActive: true,
      sortOrder: 5,
    },
    {
      sectionKey: "footer_banner",
      title: "Footer Banner",
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const section of sections) {
    await prisma.homepageSectionControl.upsert({
      where: {
        sectionKey: section.sectionKey,
      },
      update: {
        title: section.title,
        isActive: section.isActive,
        sortOrder: section.sortOrder,
      },
      create: section,
    });
  }

  console.log("Homepage sections seeded successfully ✅");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });