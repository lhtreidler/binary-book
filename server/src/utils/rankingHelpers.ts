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

const toOneDecimal = (num: number) => Number(num.toFixed(1));

export const convertRawScoreToScore = async (
  userId: string,
  rawScore: number,
  level: number,
) => {
  const { maxRaw, minRaw } = await getHighestLowestScores(userId, level);

  const levelAdd = level * LEVEL_SIZE;

  let add = 0;
  if (maxRaw === null || minRaw === null || maxRaw === minRaw) {
    add = 1;
  } else {
    add = (rawScore - minRaw) / (maxRaw - minRaw);
  }

  return toOneDecimal((add + level) * LEVEL_SIZE);
};

const getBookByOffset = async ({
  skip,
  userId,
  includeBook,
  level,
}: {
  skip: number;
  userId: string;
  includeBook: boolean;
  level: number;
}) => {
  const book = await prisma.ranking.findFirst({
    where: { userId, level },
    orderBy: { rawScore: "asc" },
    skip,
    take: 1,
    include: { book: includeBook },
  });

  return book;
};

const createFinalRankingAndReturnScore = async ({
  insertionIndex,
  userId,
  level,
  bookId,
}: {
  insertionIndex: number;
  userId: string;
  level: number;
  bookId: string;
}) => {
  const totalCount = await prisma.ranking.count({ where: { userId } });

  let rawScore: number;

  if (insertionIndex === 0) {
    const lowest = await getBookByOffset({
      skip: 0,
      userId,
      includeBook: false,
      level,
    });
    const secondLowest =
      totalCount > 1
        ? await getBookByOffset({ skip: 1, userId, includeBook: false, level })
        : null;
    if (!lowest || lowest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondLowest?.rawScore != null
        ? secondLowest.rawScore - lowest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = lowest.rawScore - gap;
  } else if (insertionIndex === totalCount) {
    const highest = await getBookByOffset({
      skip: totalCount - 1,
      userId,
      includeBook: false,
      level,
    });
    const secondHighest =
      totalCount > 1
        ? await getBookByOffset({
            skip: totalCount - 2,
            userId,
            includeBook: false,
            level,
          })
        : null;
    if (!highest || highest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondHighest?.rawScore != null
        ? highest.rawScore - secondHighest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = highest.rawScore + gap;
  } else {
    const [lowRanking, highRanking] = await Promise.all([
      getBookByOffset({
        skip: insertionIndex - 1,
        userId,
        includeBook: false,
        level,
      }),
      getBookByOffset({
        skip: insertionIndex,
        userId,
        includeBook: false,
        level,
      }),
    ]);
    if (
      !lowRanking ||
      lowRanking.rawScore === null ||
      !highRanking ||
      highRanking.rawScore === null
    ) {
      throw new Error("Could not find rankings");
    }
    rawScore = (lowRanking.rawScore + highRanking.rawScore) / 2;
  }

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
  if (low >= high) {
    const score = await createFinalRankingAndReturnScore({
      insertionIndex: low,
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
    level,
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  await prisma.rankingSession.update({
    where: { id: rankingSessionId },
    data: { low, high },
  });

  const { book } = rankingToCompare;

  return {
    compareBook: { title: book.title, authors: book.authors },
  };
};
