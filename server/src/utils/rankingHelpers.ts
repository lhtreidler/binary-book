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

const getBookByOffset = async ({
  skip,
  userId,
  includeBook,
}: {
  skip: number;
  userId: string;
  includeBook: boolean;
}) => {
  const book = await prisma.ranking.findFirst({
    where: { userId },
    orderBy: { rawScore: "asc" },
    skip,
    take: 1,
    include: { book: includeBook },
  });

  return book;
};

const createFinalRankingAndReturnScore = async ({
  low,
  high,
  userId,
  level,
  bookId,
}: {
  low: number;
  high: number;
  userId: string;
  level: number;
  bookId: string;
}) => {
  // Create final ranking entry with the determined score
  const [lowRanking, highRanking] = await Promise.all(
    [low, high].map(
      async (skip) =>
        await getBookByOffset({ skip, userId, includeBook: false }),
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
      rawScore,
      bookId,
      level,
    },
  });

  return convertRawScoreToScore(userId, rawScore, level);
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
  level: number;
}) => {
  // If low and high are adjacent, we have found the score
  if (low >= high - 1) {
    const score = await createFinalRankingAndReturnScore({
      low,
      high,
      userId,
      level,
      bookId,
    });
    // Clean up the ranking session
    await prisma.rankingSession.delete({
      where: { id: rankingSessionId },
    });

    // Return the final score and no further comparisons needed
    return { score };
  }

  const skip = Math.floor((low + high) / 2);

  const rankingToCompare = await getBookByOffset({
    skip,
    userId,
    includeBook: true,
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
    compareBook: { title: book.title, authors: book.authors },
  };
};
