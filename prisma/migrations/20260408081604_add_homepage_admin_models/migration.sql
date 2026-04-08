-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "bannerType" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "storeSlug" TEXT,
    "category" TEXT,
    "source" TEXT,
    "externalId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "rawPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageSectionControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageFeaturedOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "priceText" TEXT,
    "oldPriceText" TEXT,
    "discountText" TEXT,
    "bankOfferText" TEXT,
    "cashbackText" TEXT,
    "validTillText" TEXT,
    "ctaText" TEXT DEFAULT 'View Deal',
    "ctaUrl" TEXT,
    "category" TEXT,
    "source" TEXT,
    "externalId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "rawPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PromoBanner_placement_idx" ON "PromoBanner"("placement");

-- CreateIndex
CREATE INDEX "PromoBanner_category_idx" ON "PromoBanner"("category");

-- CreateIndex
CREATE INDEX "PromoBanner_storeSlug_idx" ON "PromoBanner"("storeSlug");

-- CreateIndex
CREATE INDEX "PromoBanner_isActive_idx" ON "PromoBanner"("isActive");

-- CreateIndex
CREATE INDEX "PromoBanner_priority_idx" ON "PromoBanner"("priority");

-- CreateIndex
CREATE INDEX "PromoBanner_source_idx" ON "PromoBanner"("source");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSectionControl_sectionKey_key" ON "HomepageSectionControl"("sectionKey");

-- CreateIndex
CREATE INDEX "HomepageSectionControl_isActive_idx" ON "HomepageSectionControl"("isActive");

-- CreateIndex
CREATE INDEX "HomepageSectionControl_sortOrder_idx" ON "HomepageSectionControl"("sortOrder");

-- CreateIndex
CREATE INDEX "HomepageFeaturedOffer_storeSlug_idx" ON "HomepageFeaturedOffer"("storeSlug");

-- CreateIndex
CREATE INDEX "HomepageFeaturedOffer_category_idx" ON "HomepageFeaturedOffer"("category");

-- CreateIndex
CREATE INDEX "HomepageFeaturedOffer_isActive_idx" ON "HomepageFeaturedOffer"("isActive");

-- CreateIndex
CREATE INDEX "HomepageFeaturedOffer_priority_idx" ON "HomepageFeaturedOffer"("priority");

-- CreateIndex
CREATE INDEX "HomepageFeaturedOffer_source_idx" ON "HomepageFeaturedOffer"("source");
