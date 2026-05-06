import { prisma } from "../lib/prisma";

const MAX_SCORE = 10;
const LEVEL_COUNT = 3;
const LEVEL_SIZE = MAX_SCORE / LEVEL_COUNT;

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
