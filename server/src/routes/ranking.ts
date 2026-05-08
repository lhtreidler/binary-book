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
import {
  convertRawScoreToScore,
  handleRankingSearch,
  STARTING_RAW_SCORE,
} from "../utils/rankingHelpers";
import { getOrCreateBook } from "../lib/thirdParty";

const router = Router();
router.use(authenticateToken);

router.post("/start", validateBody(startRankingSchema), async (req, res) => {
  try {
    const { userId } = req.user || {};

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { rankingLevel, gId } = req.body as StartRankingInput;

    const book = await getOrCreateBook(gId);

    const { id: bookId } = book;

    const rankingCount = await prisma.ranking.count({
      where: { userId, level: rankingLevel },
    });

    if (rankingCount === 0) {
      const rawScore = STARTING_RAW_SCORE;
      await prisma.ranking.create({
        data: {
          userId,
          rawScore,
          bookId,
          level: rankingLevel,
        },
      });

      const score = await convertRawScoreToScore(
        userId,
        rawScore,
        rankingLevel,
      );

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
      level: rankingSession.level,
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

      const newLow = choseNew ? avg + 1 : low;
      const newHigh = choseNew ? high : avg;

      const result = await handleRankingSearch({
        userId,
        rankingSessionId,
        bookId: rankingSession.bookId,
        low: newLow,
        high: newHigh,
        level: rankingSession.level,
      });

      res.send(result);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
