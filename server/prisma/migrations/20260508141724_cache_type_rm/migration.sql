/*
  Warnings:

  - You are about to drop the column `type` on the `SearchCache` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SearchCache" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CacheType";
