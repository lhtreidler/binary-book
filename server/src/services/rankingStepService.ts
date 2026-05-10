import { prisma } from "../lib/prisma";

const getStepAndDeleteNext = async ({
  rankingSessionId,
  seq,
  userId,
}: {
  rankingSessionId: string;
  seq: number;
  userId: string;
}) => {
  const [step] = await Promise.all([
    prisma.rankingStep.findFirst({
      where: {
        seq,
        rankingSession: {
          id: rankingSessionId,
          userId,
        },
      },
      include: {
        rankingSession: true,
      },
    }),
    prisma.rankingStep.deleteMany({
      where: {
        seq: {
          gt: seq,
        },
        rankingSession: {
          id: rankingSessionId,
          userId,
        },
      },
    }),
  ]);

  if (!step) {
    throw new Error("Step not found");
  }

  return step;
};

export const rankingStepService = {
  getStepAndDeleteNext,
};
