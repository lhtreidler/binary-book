import { prisma } from "../lib/prisma";

const MAX_SCORE = 10;
const LEVEL_COUNT = 3;
const LEVEL_SIZE = MAX_SCORE / LEVEL_COUNT;

export const STARTING_RAW_SCORE = 10_000;

export const getHighestLowestScores = async (userId: string, level: number) => {
  const where = { userId, level };
  const [highest, lowest] = await Promise.all([
    prisma.ranking.findFirst({
      where,
      orderBy: { rawScore: "desc" },
    }),
    prisma.ranking.findFirst({
      where,
      orderBy: { rawScore: "asc" },
    }),
  ]);

  const maxRaw = highest?.rawScore ?? null;
  const minRaw = lowest?.rawScore ?? null;

  return { maxRaw, minRaw };
};

export const convertRawScoreToScore = async (
  userId: string,
  rawScore: number,
  level: number,
) => {
  const { maxRaw, minRaw } = await getHighestLowestScores(userId, level);

  const levelAdd = level * LEVEL_SIZE;

  if (maxRaw === null || minRaw === null) {
    return levelAdd + LEVEL_SIZE;
  }

  return levelAdd + (rawScore - minRaw) / (maxRaw - minRaw);
};

export const handleRankingSearch = async ({
  userId,
  rankingSessionId,
  bookId,
  low,
  high,
  level,
}: {
  userId: string;
  rankingSessionId: string;
  bookId: string;
  low: number;
  high: number;
  level: 0;
}) => {
  // If low and high are adjacent, we have found the score
  if (low >= high - 1) {
    // Create final ranking entry with the determined score

    const [lowRanking, highRanking] = await Promise.all(
      [low, high].map(
        async (skip) =>
          await prisma.ranking.findFirst({
            where: { userId },
            skip,
          }),
      ),
    );

    if (
      !lowRanking ||
      lowRanking.rawScore === null ||
      !highRanking ||
      highRanking.rawScore === null
    ) {
      throw new Error("Could not find rankings");
    }

    const rawScore = (lowRanking.rawScore + highRanking.rawScore) / 2;

    await prisma.ranking.create({
      data: {
        userId,
        rawScore: rawScore,
        bookId,
        level,
      },
    });

    // Clean up the ranking session
    await prisma.rankingSession.delete({
      where: { id: rankingSessionId },
    });

    const convertedScore = await convertRawScoreToScore(
      userId,
      rawScore,
      level,
    );

    // Return the final score and no further comparisons needed
    return { score: convertedScore };
  }

  const skip = Math.floor((low + high) / 2);

  const rankingToCompare = await prisma.ranking.findFirst({
    where: { userId },
    orderBy: { rawScore: "asc" },
    skip,
    take: 1,
    include: { book: true },
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  await prisma.rankingSession.update({
    where: { id: rankingSessionId },
    data: { low, high },
  });

  const { book, ...rest } = rankingToCompare;
  return {
    rankingToCompare: rest,
    compareBook: { title: book.title, authors: book.authors },
  };
};
