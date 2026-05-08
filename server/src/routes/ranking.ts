import { Router } from "express";
import { validateBody } from "../middleware/validation";
import {
  ContinueRankingInput,
  continueRankingSchema,
  StartRankingInput,
  startRankingSchema,
} from "../utils/schemas";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { convertRawScoreToScore } from "../utils/score";
import { getGoogleBook } from "../lib/thirdParty";

const router = Router();
router.use(authenticateToken);

const handleRankingSearch = async ({
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
  level: 0;
}) => {
  // If low and high are adjacent, we have found the score
  if (low >= high - 1) {
    // Create final ranking entry with the determined score
    const score = Math.floor((low + high) / 2);
    await prisma.ranking.create({
      data: {
        userId,
        rawScore: score,
        bookId,
        level,
      },
    });

    // Clean up the ranking session
    await prisma.rankingSession.delete({
      where: { id: rankingSessionId },
    });

    const convertedScore = await convertRawScoreToScore(userId, score, level);

    // Return the final score and no further comparisons needed
    return { score: convertedScore };
  }

  const skip = Math.floor((low + high) / 2);

  const rankingToCompare = await prisma.ranking.findFirst({
    where: { userId },
    orderBy: { rawScore: "asc" },
    skip,
    take: 1,
    include: { book: true },
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  await prisma.rankingSession.update({
    where: { id: rankingSessionId },
    data: { low, high },
  });

  const { book, ...rest } = rankingToCompare;
  return {
    rankingToCompare: rest,
    compareBook: { title: book.title, authors: book.authors },
  };
};

router.post("/start", validateBody(startRankingSchema), async (req, res) => {
  try {
    console.log("start");
    const { userId } = req.user || {};

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { rankingLevel, gId, title, authors } = req.body as StartRankingInput;

    let bookRecord = await prisma.book.findFirst({
      where: { googleId: gId },
    });

    if (!bookRecord) {
      bookRecord = await prisma.book.create({
        data: {
          googleId: gId,
          title,
          authors,
        },
      });
    }

    const bookId = bookRecord.id;

    const rankingCount = await prisma.ranking.count({ where: { userId } });

    if (rankingCount === 0) {
      await prisma.ranking.create({
        data: { userId, rawScore: 0, bookId, level: rankingLevel },
      });
      const score = await convertRawScoreToScore(userId, 0, rankingLevel);
      res.send({ score });
      return;
    }

    const rankingSession = await prisma.rankingSession.create({
      data: { userId, level: rankingLevel, bookId },
    });

    const result = await handleRankingSearch({
      userId,
      rankingSessionId: rankingSession.id,
      bookId,
      low: 0,
      high: rankingCount,
      level: 0,
    });

    res.send({ ...result, sessionId: rankingSession.id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/continue",
  validateBody(continueRankingSchema),
  async (req, res) => {
    try {
      const { userId } = req.user || {};

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { sessionId: rankingSessionId, choseNew } =
        req.body as ContinueRankingInput;

      const rankingSession = await prisma.rankingSession.findUnique({
        where: { id: rankingSessionId },
      });

      if (!rankingSession) {
        res.status(404).json({ error: "Ranking session not found" });
        return;
      }

      const { low, high } = rankingSession;

      if (low === null || high === null) {
        res.status(400).json({ error: "Invalid ranking session state" });
        return;
      }

      if (rankingSession.userId !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const avg = Math.floor((low + high) / 2);

      const newLow = choseNew ? avg : low;
      const newHigh = choseNew ? high : avg;

      const result = await handleRankingSearch({
        userId,
        rankingSessionId,
        bookId: rankingSession.bookId,
        low: newLow,
        high: newHigh,
        level: 0,
      });

      res.send(result);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
