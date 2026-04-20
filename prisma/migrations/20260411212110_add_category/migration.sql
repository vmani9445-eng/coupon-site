/*
  Warnings:

  - You are about to drop the column `category` on the `Coupon` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "discount" TEXT,
    "bank" TEXT,
    "affiliateUrl" TEXT,
    "expiresAt" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "usesToday" INTEGER NOT NULL DEFAULT 0,
    "terms" JSONB,
    "rawPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Coupon_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Coupon" ("affiliateUrl", "bank", "clicks", "code", "createdAt", "description", "discount", "expiresAt", "externalId", "id", "isActive", "isFeatured", "rawPayload", "source", "status", "storeId", "terms", "title", "updatedAt", "usesToday", "verified") SELECT "affiliateUrl", "bank", "clicks", "code", "createdAt", "description", "discount", "expiresAt", "externalId", "id", "isActive", "isFeatured", "rawPayload", "source", "status", "storeId", "terms", "title", "updatedAt", "usesToday", "verified" FROM "Coupon";
DROP TABLE "Coupon";
ALTER TABLE "new_Coupon" RENAME TO "Coupon";
CREATE INDEX "Coupon_storeId_idx" ON "Coupon"("storeId");
CREATE INDEX "Coupon_categoryId_idx" ON "Coupon"("categoryId");
CREATE UNIQUE INDEX "Coupon_source_externalId_key" ON "Coupon"("source", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
