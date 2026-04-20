-- AlterTable
ALTER TABLE "CashbackOffer" ADD COLUMN "adminMargin" REAL;
ALTER TABLE "CashbackOffer" ADD COLUMN "cashbackLabel" TEXT;
ALTER TABLE "CashbackOffer" ADD COLUMN "networkCashback" REAL;
ALTER TABLE "CashbackOffer" ADD COLUMN "userCashback" REAL;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN "adminMargin" REAL;
ALTER TABLE "Coupon" ADD COLUMN "cashbackLabel" TEXT;
ALTER TABLE "Coupon" ADD COLUMN "networkCashback" REAL;
ALTER TABLE "Coupon" ADD COLUMN "userCashback" REAL;
