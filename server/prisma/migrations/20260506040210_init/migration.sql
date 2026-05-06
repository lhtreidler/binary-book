-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" UUID NOT NULL,
    "googleId" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" UUID NOT NULL,
    "bookId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rawScore" DOUBLE PRECISION,
    "level" INTEGER,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bookId" UUID NOT NULL,
    "low" INTEGER,
    "high" INTEGER,

    CONSTRAINT "RankingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ranking_bookId_idx" ON "Ranking"("bookId");

-- CreateIndex
CREATE INDEX "Ranking_userId_idx" ON "Ranking"("userId");

-- CreateIndex
CREATE INDEX "RankingSession_userId_idx" ON "RankingSession"("userId");

-- CreateIndex
CREATE INDEX "RankingSession_bookId_idx" ON "RankingSession"("bookId");

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSession" ADD CONSTRAINT "RankingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSession" ADD CONSTRAINT "RankingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
