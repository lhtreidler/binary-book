import { RankingSession, RankingStep } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { OmitSystem } from "../utils/type-utils";

type BaseRankingStep = OmitSystem<RankingStep>;

const createSessionAndFirstStep = async ({
  userId,
  data,
}: {
  userId: string;
  data: Omit<BaseRankingStep, "rankingSessionId" | "seq">;
}) => {
  return prisma.rankingSession.create({
    data: {
      userId,
      rankingSteps: {
        create: {
          ...data,
          seq: 1,
        },
      },
    },
  });
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
    include: {
      rankingSteps: true,
    },
  });
};

export const rankingSessionService = {
  createSessionAndFirstStep,
  getById,
  delete: deleteSession,
  update,
};
