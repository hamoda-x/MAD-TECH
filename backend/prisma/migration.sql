-- First add categoryId as nullable
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

-- Update existing products based on the old category enum
UPDATE "Product" SET "categoryId" = (SELECT id FROM "Category" WHERE slug = CAST("category" AS TEXT) LIMIT 1);

-- Now make it NOT NULL where possible
UPDATE "Product" SET "categoryId" = (SELECT id FROM "Category" LIMIT 1) WHERE "categoryId" IS NULL;

-- Make NOT NULL
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old category column
ALTER TABLE "Product" DROP COLUMN "category";

-- Add foreign key
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
