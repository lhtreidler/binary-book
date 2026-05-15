/*
  Warnings:

  - Changed the type of `jsonResult` on the `SearchCache` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SearchCache" DROP COLUMN "jsonResult",
ADD COLUMN     "jsonResult" JSONB NOT NULL;
