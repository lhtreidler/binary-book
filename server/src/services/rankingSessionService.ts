import { RankingSession } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

type BaseRankingSession = Omit<
  RankingSession,
  "updatedAt" | "createdAt" | "id"
>;

const create = (data: Omit<BaseRankingSession, "low" | "high">) => {
  return prisma.rankingSession.create({ data });
};

const update = ({ id, ...data }: { id: string; high: number; low: number }) => {
  return prisma.rankingSession.update({
    where: { id },
    data,
  });
};

const getById = (where: { id: string; userId: string }) => {
  return prisma.rankingSession.findUnique({
    where,
  });
};

const deleteSession = (where: { id: string; userId: string }) => {
  return prisma.rankingSession.delete({
    where,
  });
};

export const rankingSessionService = {
  create,
  getById,
  delete: deleteSession,
  update,
};
