-- Schema completo do Pedidos ConectZ para Supabase
-- Execute no SQL Editor do Supabase se criou o banco manualmente e algo deu errado.
-- ATENÇÃO: Se já existem tabelas, este script vai falhar. Use apenas em banco vazio ou ajuste (DROP IF EXISTS).

-- Enums
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'MERCHANT_ADMIN');
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH');
CREATE TYPE "PaymentTiming" AS ENUM ('ON_ORDER', 'ON_PICKUP_OR_DELIVERY');
CREATE TYPE "ModificationType" AS ENUM ('REMOVE', 'SUBSTITUTE', 'EXTRA');

-- Tabelas (nomes exatos: "User", "Merchant" — com aspas, case-sensitive)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MERCHANT_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchantId" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionStatus" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "cancellationFeeCents" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngredientGroup" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IngredientGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePriceCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductIngredient" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "groupId" TEXT,
    "isRemovable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ProductIngredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductIngredientEquivalence" (
    "id" TEXT NOT NULL,
    "productIngredientId" TEXT NOT NULL,
    "baseIngredientId" TEXT NOT NULL,
    "equivalentIngredientId" TEXT NOT NULL,
    CONSTRAINT "ProductIngredientEquivalence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductExtra" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "extraPriceCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductExtra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "customerName" TEXT NOT NULL,
    "customerWhatsApp" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "address" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentTiming" "PaymentTiming" NOT NULL,
    "cashChangeForCents" INTEGER,
    "subtotalCents" INTEGER NOT NULL,
    "cancellationFeeCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "basePriceCents" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItemModification" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "type" "ModificationType" NOT NULL,
    "baseIngredientName" TEXT,
    "chosenIngredientName" TEXT,
    "priceDeltaCents" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OrderItemModification_pkey" PRIMARY KEY ("id")
);

-- Índices
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Merchant_slug_key" ON "Merchant"("slug");
CREATE INDEX "IngredientGroup_merchantId_idx" ON "IngredientGroup"("merchantId");
CREATE UNIQUE INDEX "IngredientGroup_merchantId_name_key" ON "IngredientGroup"("merchantId", "name");
CREATE INDEX "Ingredient_merchantId_idx" ON "Ingredient"("merchantId");
CREATE UNIQUE INDEX "Ingredient_merchantId_name_key" ON "Ingredient"("merchantId", "name");
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");
CREATE INDEX "ProductIngredient_productId_idx" ON "ProductIngredient"("productId");
CREATE UNIQUE INDEX "ProductIngredient_productId_ingredientId_key" ON "ProductIngredient"("productId", "ingredientId");
CREATE INDEX "ProductIngredientEquivalence_productIngredientId_idx" ON "ProductIngredientEquivalence"("productIngredientId");
CREATE UNIQUE INDEX "ProductIngredientEquivalence_productIngredientId_equivalentIngredientId_key" ON "ProductIngredientEquivalence"("productIngredientId", "equivalentIngredientId");
CREATE INDEX "ProductExtra_productId_idx" ON "ProductExtra"("productId");
CREATE UNIQUE INDEX "ProductExtra_productId_ingredientId_key" ON "ProductExtra"("productId", "ingredientId");
CREATE INDEX "Order_merchantId_createdAt_idx" ON "Order"("merchantId", "createdAt");
CREATE INDEX "Order_merchantId_status_idx" ON "Order"("merchantId", "status");
CREATE UNIQUE INDEX "Order_merchantId_publicCode_key" ON "Order"("merchantId", "publicCode");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItemModification_orderItemId_idx" ON "OrderItemModification"("orderItemId");

-- FKs
ALTER TABLE "User" ADD CONSTRAINT "User_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IngredientGroup" ADD CONSTRAINT "IngredientGroup_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IngredientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IngredientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductIngredient" ADD CONSTRAINT "ProductIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductIngredientEquivalence" ADD CONSTRAINT "ProductIngredientEquivalence_baseIngredientId_fkey" FOREIGN KEY ("baseIngredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductIngredientEquivalence" ADD CONSTRAINT "ProductIngredientEquivalence_equivalentIngredientId_fkey" FOREIGN KEY ("equivalentIngredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductIngredientEquivalence" ADD CONSTRAINT "ProductIngredientEquivalence_productIngredientId_fkey" FOREIGN KEY ("productIngredientId") REFERENCES "ProductIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductExtra" ADD CONSTRAINT "ProductExtra_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductExtra" ADD CONSTRAINT "ProductExtra_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItemModification" ADD CONSTRAINT "OrderItemModification_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
