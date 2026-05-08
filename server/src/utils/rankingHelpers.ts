import { Ranking } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { rankingService, rankingSessionService } from "../services";

const MAX_SCORE = 10;
const LEVEL_COUNT = 3;
const LEVEL_SIZE = MAX_SCORE / LEVEL_COUNT;

export const STARTING_RAW_SCORE = 10_000;

export const getHighestLowestScores = async (userId: string, level: number) => {
  const data = { userId, level };
  const [highest, lowest] = await Promise.all([
    rankingService.getHighestRanking(data),
    rankingService.getLowestRanking(data),
  ]);

  const maxRaw = highest?.rawScore ?? null;
  const minRaw = lowest?.rawScore ?? null;

  return { maxRaw, minRaw };
};

const toOneDecimal = (num: number) => Number(num.toFixed(1));

export const calculateScore = ({
  rawScore,
  level,
  minRaw,
  maxRaw,
}: {
  rawScore: number;
  level: number;
  minRaw: number | null;
  maxRaw: number | null;
}) => {
  let add = 0;
  if (maxRaw === null || minRaw === null || maxRaw === minRaw) {
    add = 1;
  } else {
    add = (rawScore - minRaw) / (maxRaw - minRaw);
  }

  return toOneDecimal((add + level) * LEVEL_SIZE);
};

export const convertRawScoreToScore = async (
  userId: string,
  rawScore: number,
  level: number,
) => {
  const { maxRaw, minRaw } = await getHighestLowestScores(userId, level);

  return calculateScore({ rawScore, level, minRaw, maxRaw });
};

export const getScoreFromRanking = async ({
  userId,
  rawScore,
  level,
}: Ranking) => {
  return convertRawScoreToScore(userId, rawScore, level);
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
  const totalCount = await rankingService.getRankingCountByLevel({
    userId,
    level,
  });

  let rawScore: number;

  const getBook = async (skip: number) =>
    rankingService.getBookByOffset({
      skip,
      userId,
      includeBook: false,
      level,
    });

  if (insertionIndex === 0) {
    const [lowest, secondLowest] = await Promise.all([
      getBook(0),
      totalCount > 1 ? getBook(1) : null,
    ]);

    if (!lowest || lowest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondLowest?.rawScore != null
        ? secondLowest.rawScore - lowest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = lowest.rawScore - gap;
  } else if (insertionIndex === totalCount) {
    const [highest, secondHighest] = await Promise.all([
      getBook(totalCount - 1),
      totalCount > 1 ? getBook(totalCount - 2) : null,
    ]);
    if (!highest || highest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondHighest?.rawScore != null
        ? highest.rawScore - secondHighest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = highest.rawScore + gap;
  } else {
    const [lowRanking, highRanking] = await Promise.all(
      [insertionIndex - 1, insertionIndex].map(getBook),
    );
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

  await rankingService.createRanking({
    userId,
    rawScore,
    bookId,
    level,
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
    await rankingSessionService.delete({ id: rankingSessionId, userId });

    // Return the final score and no further comparisons needed
    return { score, bookId };
  }

  const skip = Math.floor((low + high) / 2);

  const rankingToCompare = await rankingService.getBookByOffset({
    skip,
    userId,
    includeBook: true,
    level,
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  await rankingSessionService.update({ high, low, id: rankingSessionId });

  const { book } = rankingToCompare;

  return {
    compareBook: { title: book.title, authors: book.authors },
  };
};
