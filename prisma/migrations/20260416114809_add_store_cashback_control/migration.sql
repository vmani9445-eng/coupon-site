-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashbackTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "clickLogId" TEXT,
    "storeId" TEXT,
    "couponId" TEXT,
    "cashbackOfferId" TEXT,
    "source" TEXT,
    "externalOrderId" TEXT,
    "externalTrackingId" TEXT,
    "orderAmount" INTEGER,
    "commissionAmount" INTEGER,
    "cashbackAmount" INTEGER NOT NULL,
    "platformMarginAmount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "purchaseAt" DATETIME,
    "trackedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "rejectedAt" DATETIME,
    "payableAt" DATETIME,
    "paidAt" DATETIME,
    "rejectionReason" TEXT,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CashbackTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_clickLogId_fkey" FOREIGN KEY ("clickLogId") REFERENCES "ClickLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_cashbackOfferId_fkey" FOREIGN KEY ("cashbackOfferId") REFERENCES "CashbackOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CashbackTransaction" ("adminNotes", "cashbackAmount", "cashbackOfferId", "clickLogId", "commissionAmount", "confirmedAt", "couponId", "createdAt", "externalOrderId", "externalTrackingId", "id", "orderAmount", "paidAt", "payableAt", "platformMarginAmount", "purchaseAt", "rejectedAt", "rejectionReason", "source", "status", "storeId", "trackedAt", "updatedAt", "userId", "walletId") SELECT "adminNotes", "cashbackAmount", "cashbackOfferId", "clickLogId", "commissionAmount", "confirmedAt", "couponId", "createdAt", "externalOrderId", "externalTrackingId", "id", "orderAmount", "paidAt", "payableAt", "platformMarginAmount", "purchaseAt", "rejectedAt", "rejectionReason", "source", "status", "storeId", "trackedAt", "updatedAt", "userId", "walletId" FROM "CashbackTransaction";
DROP TABLE "CashbackTransaction";
ALTER TABLE "new_CashbackTransaction" RENAME TO "CashbackTransaction";
CREATE INDEX "CashbackTransaction_userId_idx" ON "CashbackTransaction"("userId");
CREATE INDEX "CashbackTransaction_walletId_idx" ON "CashbackTransaction"("walletId");
CREATE INDEX "CashbackTransaction_clickLogId_idx" ON "CashbackTransaction"("clickLogId");
CREATE INDEX "CashbackTransaction_storeId_idx" ON "CashbackTransaction"("storeId");
CREATE INDEX "CashbackTransaction_couponId_idx" ON "CashbackTransaction"("couponId");
CREATE INDEX "CashbackTransaction_cashbackOfferId_idx" ON "CashbackTransaction"("cashbackOfferId");
CREATE INDEX "CashbackTransaction_status_idx" ON "CashbackTransaction"("status");
CREATE INDEX "CashbackTransaction_trackedAt_idx" ON "CashbackTransaction"("trackedAt");
CREATE INDEX "CashbackTransaction_confirmedAt_idx" ON "CashbackTransaction"("confirmedAt");
CREATE INDEX "CashbackTransaction_payableAt_idx" ON "CashbackTransaction"("payableAt");
CREATE INDEX "CashbackTransaction_paidAt_idx" ON "CashbackTransaction"("paidAt");
CREATE INDEX "CashbackTransaction_externalOrderId_idx" ON "CashbackTransaction"("externalOrderId");
CREATE INDEX "CashbackTransaction_externalTrackingId_idx" ON "CashbackTransaction"("externalTrackingId");
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "websiteUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cashbackPercentToUser" INTEGER NOT NULL DEFAULT 70,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("createdAt", "description", "id", "isActive", "isFeatured", "logo", "name", "slug", "updatedAt", "websiteUrl") SELECT "createdAt", "description", "id", "isActive", "isFeatured", "logo", "name", "slug", "updatedAt", "websiteUrl" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE INDEX "Store_slug_idx" ON "Store"("slug");
CREATE INDEX "Store_isFeatured_idx" ON "Store"("isFeatured");
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");
CREATE TABLE "new_WalletLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "entryType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "description" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WalletLedger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WalletLedger" ("amount", "createdAt", "description", "entryType", "id", "referenceId", "referenceType", "status", "updatedAt", "userId", "walletId") SELECT "amount", "createdAt", "description", "entryType", "id", "referenceId", "referenceType", "status", "updatedAt", "userId", "walletId" FROM "WalletLedger";
DROP TABLE "WalletLedger";
ALTER TABLE "new_WalletLedger" RENAME TO "WalletLedger";
CREATE INDEX "WalletLedger_userId_idx" ON "WalletLedger"("userId");
CREATE INDEX "WalletLedger_walletId_idx" ON "WalletLedger"("walletId");
CREATE INDEX "WalletLedger_entryType_idx" ON "WalletLedger"("entryType");
CREATE INDEX "WalletLedger_status_idx" ON "WalletLedger"("status");
CREATE INDEX "WalletLedger_referenceType_referenceId_idx" ON "WalletLedger"("referenceType", "referenceId");
CREATE INDEX "WalletLedger_createdAt_idx" ON "WalletLedger"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
