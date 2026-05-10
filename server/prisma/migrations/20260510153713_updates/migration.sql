/*
  Warnings:

  - You are about to drop the column `bookId` on the `RankingSession` table. All the data in the column will be lost.
  - You are about to drop the column `high` on the `RankingSession` table. All the data in the column will be lost.
  - You are about to drop the column `low` on the `RankingSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RankingSession" DROP CONSTRAINT "RankingSession_bookId_fkey";

-- DropIndex
DROP INDEX "RankingSession_bookId_idx";

-- AlterTable
ALTER TABLE "RankingSession" DROP COLUMN "bookId",
DROP COLUMN "high",
DROP COLUMN "low";

-- CreateTable
CREATE TABLE "RankingStep" (
    "id" UUID NOT NULL,
    "bookId" UUID NOT NULL,
    "rankingSessionId" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "low" INTEGER NOT NULL,
    "high" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RankingStep_bookId_idx" ON "RankingStep"("bookId");

-- CreateIndex
CREATE INDEX "RankingStep_rankingSessionId_idx" ON "RankingStep"("rankingSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingStep_rankingSessionId_seq_key" ON "RankingStep"("rankingSessionId", "seq");

-- AddForeignKey
ALTER TABLE "RankingStep" ADD CONSTRAINT "RankingStep_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingStep" ADD CONSTRAINT "RankingStep_rankingSessionId_fkey" FOREIGN KEY ("rankingSessionId") REFERENCES "RankingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
