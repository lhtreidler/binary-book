import { Ranking } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { handlePaginatedRequest } from "../utils/pagination";

type MinMax = { minRaw: number | null; maxRaw: number | null };
type BaseRanking = Omit<Ranking, "updatedAt" | "createdAt" | "id">;

const MAX_SCORE = 10;
const LEVEL_COUNT = 3;
const LEVEL_SIZE = MAX_SCORE / LEVEL_COUNT;

export const STARTING_RAW_SCORE = 10_000;

const toOneDecimal = (num: number) => Number(num.toFixed(1));

const calculateScore = ({
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

const getRankingScore = async ({
  userId,
  rawScore,
  level,
}: {
  userId: string;
  rawScore: number;
  level: number;
}) => {
  const { maxRaw, minRaw } = await rankingService.getHighestLowestRankingScores(
    userId,
    level,
  );

  return calculateScore({ rawScore, level, minRaw, maxRaw });
};

const getHighestRanking = async ({
  userId,
  level,
}: Pick<BaseRanking, "userId" | "level">) => {
  return prisma.ranking.findFirst({
    where: { userId, level },
    orderBy: { rawScore: "desc" },
  });
};

const getLowestRanking = async ({
  userId,
  level,
}: Pick<BaseRanking, "userId" | "level">) => {
  return prisma.ranking.findFirst({
    where: { userId, level },
    orderBy: { rawScore: "asc" },
  });
};

const getHighestLowestRankingScores = async (userId: string, level: number) => {
  const data = { userId, level };
  const [highest, lowest] = await Promise.all([
    getHighestRanking(data),
    getLowestRanking(data),
  ]);

  const maxRaw = highest?.rawScore ?? null;
  const minRaw = lowest?.rawScore ?? null;

  return { maxRaw, minRaw };
};

const getPaginatedRankingsByUser = async ({
  userId,
  page,
}: {
  userId: string;
  page?: number;
}) => {
  const { result: rankings, nextPage } = await handlePaginatedRequest({
    page,
    callback: (params) =>
      prisma.ranking.findMany({
        where: {
          userId,
        },
        include: {
          book: true,
        },
        orderBy: [{ level: "desc" }, { rawScore: "desc" }],
        ...params,
      }),
  });

  if (!rankings.length) {
    return {
      list: [],
      nextPage: null,
    };
  }

  const startLevel = rankings[0].level;
  const endLevel = rankings[rankings.length - 1]?.level;

  const levelsToGet = Array.from({ length: startLevel - endLevel + 1 }).map(
    (_, i) => startLevel - i,
  );

  let levelToMinMax: Record<number, MinMax> = {};

  await Promise.all(
    levelsToGet.map(async (level) => {
      const minMax = await getHighestLowestRankingScores(userId, level);
      levelToMinMax[level] = minMax;
    }),
  );

  const formattedList = rankings
    .map(({ book: { title, authors, id: bookId }, level, rawScore }) => {
      const minMax = levelToMinMax[level];
      if (!minMax || rawScore === null || !bookId) return null;

      return {
        bookId,
        title,
        authors,
        score: calculateScore({ level, rawScore, ...minMax }),
      };
    })
    .filter((b) => !!b);

  return {
    list: formattedList,
    nextPage,
  };
};

const getRankingByBook = ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}) => {
  return prisma.ranking.findFirst({
    where: {
      userId,
      bookId,
    },
  });
};

const getRankingCountByLevel = async ({
  userId,
  level,
}: {
  userId: string;
  level: number;
}) => {
  return prisma.ranking.count({
    where: { userId, level },
  });
};

const createRankingAndGetScore = async (data: BaseRanking) => {
  const findRanking = await prisma.ranking.findFirst({
    where: {
      userId: data.userId,
      bookId: data.bookId,
    },
  });

  const ranking = await prisma.ranking.create({ data });

  const score = await getRankingScore(ranking);

  return { score, bookId: ranking.bookId };
};

const getRankingByOffset = async ({
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

export const rankingService = {
  getPaginatedRankingsByUser,
  getRankingByBook,
  getRankingCountByLevel,
  createRankingAndGetScore,
  getRankingByOffset,
  getHighestLowestRankingScores,
  getRankingScore,
};
