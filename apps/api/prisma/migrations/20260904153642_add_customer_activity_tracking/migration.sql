-- CreateEnum
CREATE TYPE "CustomerActivityType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'SEARCH', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'UPDATE_CART', 'INITIATE_CHECKOUT', 'PURCHASE', 'REGISTRATION', 'LOGIN', 'LOGOUT', 'REVIEW_SUBMITTED', 'WISHLIST_ADD', 'WISHLIST_REMOVE', 'COUPON_APPLIED', 'COUPON_REMOVED');

-- CreateTable
CREATE TABLE "CustomerActivity" (
    "id" TEXT NOT NULL,
    "type" "CustomerActivityType" NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "orderId" TEXT,
    "searchQuery" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerActivity_userId_idx" ON "CustomerActivity"("userId");

-- CreateIndex
CREATE INDEX "CustomerActivity_productId_idx" ON "CustomerActivity"("productId");

-- CreateIndex
CREATE INDEX "CustomerActivity_categoryId_idx" ON "CustomerActivity"("categoryId");

-- CreateIndex
CREATE INDEX "CustomerActivity_orderId_idx" ON "CustomerActivity"("orderId");

-- CreateIndex
CREATE INDEX "CustomerActivity_sessionId_idx" ON "CustomerActivity"("sessionId");

-- CreateIndex
CREATE INDEX "CustomerActivity_type_idx" ON "CustomerActivity"("type");

-- CreateIndex
CREATE INDEX "CustomerActivity_createdAt_idx" ON "CustomerActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CustomerActivity_type_createdAt_idx" ON "CustomerActivity"("type", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerActivity_userId_createdAt_idx" ON "CustomerActivity"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
