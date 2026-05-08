/*
  Warnings:

  - Added the required column `compareStr` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Made the column `googleId` on table `Book` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Book` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rawScore` on table `Ranking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `level` on table `Ranking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "compareStr" TEXT NOT NULL,
ALTER COLUMN "googleId" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ranking" ALTER COLUMN "rawScore" SET NOT NULL,
ALTER COLUMN "level" SET NOT NULL;
