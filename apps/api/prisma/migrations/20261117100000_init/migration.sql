-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CatalogUnit" (
    "id" TEXT NOT NULL,
    "speciesKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "types" TEXT[],
    "baseStats" JSONB NOT NULL,
    "tier" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogUnit_speciesKey_key" ON "CatalogUnit"("speciesKey");
