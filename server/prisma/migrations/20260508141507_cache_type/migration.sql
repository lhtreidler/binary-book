/*
  Warnings:

  - Added the required column `updatedAt` to the `Ranking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RankingSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SearchCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CacheType" AS ENUM ('QUERY', 'VOLUME');

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RankingSession" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SearchCache" ADD COLUMN     "type" "CacheType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
