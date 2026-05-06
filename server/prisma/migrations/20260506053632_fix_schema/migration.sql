/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `level` to the `RankingSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "authors" TEXT[],
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "RankingSession" ADD COLUMN     "level" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleId_key" ON "Book"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
