-- AlterTable
ALTER TABLE "RankingStep" ADD COLUMN     "skippedOffsets" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
