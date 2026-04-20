-- CreateTable
CREATE TABLE "Store" (
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

-- CreateTable
CREATE TABLE "Coupon" (
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
    "terms" JSONB,
    "rawPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "rawPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CashbackOffer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CouponSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "discount" TEXT,
    "category" TEXT,
    "affiliateUrl" TEXT,
    "submitter" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerifiedAt" DATETIME,
    "lastSeenAt" DATETIME,
    "referralCode" TEXT,
    "referredByUserId" TEXT,
    "upiId" TEXT,
    "upiName" TEXT,
    "giftCardPreference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionKey" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pendingBalance" INTEGER NOT NULL DEFAULT 0,
    "confirmedBalance" INTEGER NOT NULL DEFAULT 0,
    "availableBalance" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
    "lifetimeWithdrawn" INTEGER NOT NULL DEFAULT 0,
    "lifetimeRejected" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletLedger" (
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
    CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CashbackTransaction" (
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
    CONSTRAINT "CashbackTransaction_clickLogId_fkey" FOREIGN KEY ("clickLogId") REFERENCES "ClickLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashbackTransaction_cashbackOfferId_fkey" FOREIGN KEY ("cashbackOfferId") REFERENCES "CashbackOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "upiId" TEXT,
    "upiName" TEXT,
    "giftCardType" TEXT,
    "giftCardEmail" TEXT,
    "adminNotes" TEXT,
    "processedByUserId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClickLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "storeId" TEXT,
    "couponId" TEXT,
    "cashbackId" TEXT,
    "bannerId" TEXT,
    "trackingCode" TEXT,
    "clickType" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "sourcePage" TEXT,
    "sourceLabel" TEXT,
    "storeSlug" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CLICKED',
    "clickedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClickLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClickLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClickLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClickLog_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClickLog_cashbackId_fkey" FOREIGN KEY ("cashbackId") REFERENCES "CashbackOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClickLog_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "PromoBanner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_slug_idx" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_isFeatured_idx" ON "Store"("isFeatured");

-- CreateIndex
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_storeId_idx" ON "Coupon"("storeId");

-- CreateIndex
CREATE INDEX "Coupon_source_idx" ON "Coupon"("source");

-- CreateIndex
CREATE INDEX "Coupon_category_idx" ON "Coupon"("category");

-- CreateIndex
CREATE INDEX "Coupon_isFeatured_idx" ON "Coupon"("isFeatured");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_status_idx" ON "Coupon"("status");

-- CreateIndex
CREATE INDEX "Coupon_expiresAt_idx" ON "Coupon"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_source_externalId_key" ON "Coupon"("source", "externalId");

-- CreateIndex
CREATE INDEX "CashbackOffer_storeId_idx" ON "CashbackOffer"("storeId");

-- CreateIndex
CREATE INDEX "CashbackOffer_source_idx" ON "CashbackOffer"("source");

-- CreateIndex
CREATE INDEX "CashbackOffer_isFeatured_idx" ON "CashbackOffer"("isFeatured");

-- CreateIndex
CREATE INDEX "CashbackOffer_isActive_idx" ON "CashbackOffer"("isActive");

-- CreateIndex
CREATE INDEX "CashbackOffer_startsAt_idx" ON "CashbackOffer"("startsAt");

-- CreateIndex
CREATE INDEX "CashbackOffer_endsAt_idx" ON "CashbackOffer"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CashbackOffer_source_externalId_key" ON "CashbackOffer"("source", "externalId");

-- CreateIndex
CREATE INDEX "CouponSubmission_status_idx" ON "CouponSubmission"("status");

-- CreateIndex
CREATE INDEX "CouponSubmission_storeSlug_idx" ON "CouponSubmission"("storeSlug");

-- CreateIndex
CREATE INDEX "OfferClick_offerType_offerId_idx" ON "OfferClick"("offerType", "offerId");

-- CreateIndex
CREATE INDEX "OfferClick_storeSlug_idx" ON "OfferClick"("storeSlug");

-- CreateIndex
CREATE INDEX "OfferClick_createdAt_idx" ON "OfferClick"("createdAt");

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referredByUserId_idx" ON "User"("referredByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionKey_key" ON "UserSession"("sessionKey");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_sessionKey_idx" ON "UserSession"("sessionKey");

-- CreateIndex
CREATE INDEX "UserSession_lastSeenAt_idx" ON "UserSession"("lastSeenAt");

-- CreateIndex
CREATE INDEX "UserSession_isActive_idx" ON "UserSession"("isActive");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_availableBalance_idx" ON "Wallet"("availableBalance");

-- CreateIndex
CREATE INDEX "Wallet_pendingBalance_idx" ON "Wallet"("pendingBalance");

-- CreateIndex
CREATE INDEX "Wallet_confirmedBalance_idx" ON "Wallet"("confirmedBalance");

-- CreateIndex
CREATE INDEX "WalletLedger_userId_idx" ON "WalletLedger"("userId");

-- CreateIndex
CREATE INDEX "WalletLedger_walletId_idx" ON "WalletLedger"("walletId");

-- CreateIndex
CREATE INDEX "WalletLedger_entryType_idx" ON "WalletLedger"("entryType");

-- CreateIndex
CREATE INDEX "WalletLedger_status_idx" ON "WalletLedger"("status");

-- CreateIndex
CREATE INDEX "WalletLedger_referenceType_referenceId_idx" ON "WalletLedger"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "WalletLedger_createdAt_idx" ON "WalletLedger"("createdAt");

-- CreateIndex
CREATE INDEX "CashbackTransaction_userId_idx" ON "CashbackTransaction"("userId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_walletId_idx" ON "CashbackTransaction"("walletId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_clickLogId_idx" ON "CashbackTransaction"("clickLogId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_storeId_idx" ON "CashbackTransaction"("storeId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_couponId_idx" ON "CashbackTransaction"("couponId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_cashbackOfferId_idx" ON "CashbackTransaction"("cashbackOfferId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_status_idx" ON "CashbackTransaction"("status");

-- CreateIndex
CREATE INDEX "CashbackTransaction_trackedAt_idx" ON "CashbackTransaction"("trackedAt");

-- CreateIndex
CREATE INDEX "CashbackTransaction_confirmedAt_idx" ON "CashbackTransaction"("confirmedAt");

-- CreateIndex
CREATE INDEX "CashbackTransaction_payableAt_idx" ON "CashbackTransaction"("payableAt");

-- CreateIndex
CREATE INDEX "CashbackTransaction_paidAt_idx" ON "CashbackTransaction"("paidAt");

-- CreateIndex
CREATE INDEX "CashbackTransaction_externalOrderId_idx" ON "CashbackTransaction"("externalOrderId");

-- CreateIndex
CREATE INDEX "CashbackTransaction_externalTrackingId_idx" ON "CashbackTransaction"("externalTrackingId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_idx" ON "WithdrawalRequest"("userId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_method_idx" ON "WithdrawalRequest"("method");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_requestedAt_idx" ON "WithdrawalRequest"("requestedAt");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_processedByUserId_idx" ON "WithdrawalRequest"("processedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ClickLog_trackingCode_key" ON "ClickLog"("trackingCode");

-- CreateIndex
CREATE INDEX "ClickLog_userId_idx" ON "ClickLog"("userId");

-- CreateIndex
CREATE INDEX "ClickLog_sessionId_idx" ON "ClickLog"("sessionId");

-- CreateIndex
CREATE INDEX "ClickLog_storeId_idx" ON "ClickLog"("storeId");

-- CreateIndex
CREATE INDEX "ClickLog_couponId_idx" ON "ClickLog"("couponId");

-- CreateIndex
CREATE INDEX "ClickLog_cashbackId_idx" ON "ClickLog"("cashbackId");

-- CreateIndex
CREATE INDEX "ClickLog_bannerId_idx" ON "ClickLog"("bannerId");

-- CreateIndex
CREATE INDEX "ClickLog_clickType_idx" ON "ClickLog"("clickType");

-- CreateIndex
CREATE INDEX "ClickLog_status_idx" ON "ClickLog"("status");

-- CreateIndex
CREATE INDEX "ClickLog_storeSlug_idx" ON "ClickLog"("storeSlug");

-- CreateIndex
CREATE INDEX "ClickLog_clickedAt_idx" ON "ClickLog"("clickedAt");

-- CreateIndex
CREATE INDEX "ClickLog_userEmail_idx" ON "ClickLog"("userEmail");

-- CreateIndex
CREATE INDEX "ClickLog_trackingCode_idx" ON "ClickLog"("trackingCode");
