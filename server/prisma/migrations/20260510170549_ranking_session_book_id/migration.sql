/*
  Warnings:

  - You are about to drop the column `bookId` on the `RankingStep` table. All the data in the column will be lost.
  - Added the required column `bookId` to the `RankingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RankingStep" DROP CONSTRAINT "RankingStep_bookId_fkey";

-- DropIndex
DROP INDEX "RankingStep_bookId_idx";

-- AlterTable
ALTER TABLE "RankingSession" ADD COLUMN     "bookId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "RankingStep" DROP COLUMN "bookId";

-- CreateIndex
CREATE INDEX "RankingSession_bookId_idx" ON "RankingSession"("bookId");

-- AddForeignKey
ALTER TABLE "RankingSession" ADD CONSTRAINT "RankingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
