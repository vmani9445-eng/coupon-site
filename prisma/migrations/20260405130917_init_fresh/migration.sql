/*
  Warnings:

  - You are about to drop the column `storeSlug` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `source` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CashbackOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cashbackType" TEXT NOT NULL,
    "cashbackValue" REAL NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "terms" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rawPayload" JSONB,
    CONSTRAINT "CashbackOffer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfferClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerType" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "source" TEXT,
    "storeSlug" TEXT,
    "destination" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "discount" TEXT,
    "category" TEXT,
    "bank" TEXT,
    "affiliateUrl" TEXT,
    "expiresAt" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "usesToday" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rawPayload" JSONB,
    CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Coupon" ("affiliateUrl", "bank", "category", "clicks", "code", "createdAt", "description", "discount", "expiresAt", "id", "isFeatured", "status", "title", "updatedAt", "usesToday", "verified") SELECT "affiliateUrl", "bank", "category", "clicks", "code", "createdAt", "description", "discount", "expiresAt", "id", "isFeatured", "status", "title", "updatedAt", "usesToday", "verified" FROM "Coupon";
DROP TABLE "Coupon";
ALTER TABLE "new_Coupon" RENAME TO "Coupon";
CREATE INDEX "Coupon_storeId_idx" ON "Coupon"("storeId");
CREATE INDEX "Coupon_source_idx" ON "Coupon"("source");
CREATE UNIQUE INDEX "Coupon_source_externalId_key" ON "Coupon"("source", "externalId");
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "websiteUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("createdAt", "description", "id", "isFeatured", "logo", "name", "slug", "updatedAt", "websiteUrl") SELECT "createdAt", "description", "id", "isFeatured", "logo", "name", "slug", "updatedAt", "websiteUrl" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CashbackOffer_storeId_idx" ON "CashbackOffer"("storeId");

-- CreateIndex
CREATE INDEX "CashbackOffer_source_idx" ON "CashbackOffer"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CashbackOffer_source_externalId_key" ON "CashbackOffer"("source", "externalId");

-- CreateIndex
CREATE INDEX "OfferClick_offerType_offerId_idx" ON "OfferClick"("offerType", "offerId");

-- CreateIndex
CREATE INDEX "OfferClick_storeSlug_idx" ON "OfferClick"("storeSlug");
