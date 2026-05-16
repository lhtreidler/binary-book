import { RankingSession, RankingStep } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { OmitSystem } from "../../utils/type-utils";

type BaseRankingStep = OmitSystem<RankingStep>;
type CreateStep = Omit<
  BaseRankingStep,
  "rankingSessionId" | "seq" | "skippedOffsets"
>;

const getNewestStepOrThrow = async ({
  rankingSessionId,
  userId,
}: {
  rankingSessionId: string;
  userId: string;
}) => {
  const next = await prisma.rankingStep.findFirst({
    where: { rankingSessionId, rankingSession: { userId } },
    orderBy: { seq: "desc" },
  });

  if (!next) {
    throw new Error("No steps created");
  }

  return next;
};

const createSessionAndFirstStep = async ({
  userId,
  level,
  bookId,
  ...data
}: {
  userId: string;
  level: number;
  bookId: string;
} & CreateStep) => {
  const { rankingSteps, ...rankingSession } =
    await prisma.rankingSession.create({
      data: {
        userId,
        level,
        bookId,
        rankingSteps: {
          create: {
            ...data,
            seq: 1,
          },
        },
      },
      include: {
        rankingSteps: true,
      },
    });

  return { rankingStep: rankingSteps[0], rankingSession };
};

const createNextStep = async ({
  rankingSessionId,
  userId,
  ...data
}: { rankingSessionId: string; userId: string } & CreateStep) => {
  const next = await getNewestStepOrThrow({ userId, rankingSessionId });

  return prisma.rankingStep.create({
    data: {
      ...data,
      rankingSessionId: rankingSessionId,
      seq: next.seq + 1,
    },
  });
};

const getById = (where: { id: string; userId: string }) => {
  return prisma.rankingSession.findUnique({
    where,
  });
};

const deleteSession = async (where: { id: string; userId: string }) => {
  await prisma.$transaction([
    prisma.rankingStep.deleteMany({
      where: {
        rankingSession: where,
      },
    }),
    prisma.rankingSession.delete({
      where,
    }),
  ]);
};

const addSkippedOffset = async ({
  rankingSessionId,
  userId,
  offset,
}: {
  rankingSessionId: string;
  userId: string;
  offset: number;
}) => {
  const { id } = await getNewestStepOrThrow({ rankingSessionId, userId });

  await prisma.rankingStep.update({
    where: {
      rankingSessionId,
      rankingSession: {
        userId,
      },
      id,
    },
    data: {
      skippedOffsets: {
        push: offset,
      },
    },
  });
};

export const rankingSessionService = {
  createSessionAndFirstStep,
  getById,
  delete: deleteSession,
  // update,
  createNextStep,
  addSkippedOffset,
};
