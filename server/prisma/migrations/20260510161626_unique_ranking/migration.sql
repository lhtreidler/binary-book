/*
  Warnings:

  - A unique constraint covering the columns `[userId,bookId]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ranking_userId_bookId_key" ON "Ranking"("userId", "bookId");
