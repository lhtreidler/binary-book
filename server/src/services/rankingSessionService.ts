import { RankingSession, RankingStep } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { OmitSystem } from "../utils/type-utils";

type BaseRankingStep = OmitSystem<RankingStep>;
type CreateStep = Omit<BaseRankingStep, "rankingSessionId" | "seq">;

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
  sessionId,
  userId,
  ...data
}: { sessionId: string; userId: string } & CreateStep) => {
  const next = await prisma.rankingStep.findFirst({
    where: { rankingSessionId: sessionId, rankingSession: { userId } },
    orderBy: { seq: "desc" },
    select: {
      seq: true,
    },
  });

  if (!next) {
    throw new Error("No steps created");
  }

  return prisma.rankingStep.create({
    data: {
      ...data,
      rankingSessionId: sessionId,
      seq: next.seq + 1,
    },
  });
};

// const update = ({ id, ...data }: { id: string; high: number; low: number }) => {
//   return prisma.rankingSession.update({
//     where: { id },
//     data,
//   });
// };

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

export const rankingSessionService = {
  createSessionAndFirstStep,
  getById,
  delete: deleteSession,
  // update,
  createNextStep,
};
