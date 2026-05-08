import { Ranking } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { handlePaginatedRequest } from "../utils/pagination";
import {
  calculateScore,
  getHighestLowestScores,
} from "../utils/rankingHelpers";

type MinMax = { minRaw: number | null; maxRaw: number | null };
type BaseRanking = Omit<Ranking, "updatedAt" | "createdAt" | "id">;

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
      const minMax = await getHighestLowestScores(userId, level);
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

const createRanking = async (data: BaseRanking) => {
  return prisma.ranking.create({ data });
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

export const rankingService = {
  getPaginatedRankingsByUser,
  getRankingByBook,
  getRankingCountByLevel,
  createRanking,
  getLowestRanking,
  getHighestRanking,
  getBookByOffset,
};
