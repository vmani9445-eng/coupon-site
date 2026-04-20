import { prisma } from "@/lib/prisma";
import HomepageControlClient, {
  type HomepageSectionRow,
} from "./HomepageControlClient";

export default async function HomepageControlPage() {
  const sections = await prisma.homepageSectionControl.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  const formattedSections: HomepageSectionRow[] = sections.map((section) => ({
    id: section.id,
    sectionKey: section.sectionKey,
    title: section.title,
    isActive: section.isActive,
    sortOrder: section.sortOrder,
  }));

  return <HomepageControlClient sections={formattedSections} />;
}