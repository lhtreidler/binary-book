import { Router } from "express";
import { validateBody } from "../middleware/validation";
import {
  ContinueRankingInput,
  continueRankingSchema,
  QuitRankingInput,
  quitRankingSchema,
  StartRankingInput,
  startRankingSchema,
} from "../utils/schemas";
import { authenticateToken } from "../middleware/auth";
import {
  googleBooksService,
  rankingService,
  rankingSessionService,
  rankingAlgoService,
  STARTING_RAW_SCORE,
} from "../services";

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

    const book = await googleBooksService.getOrCreateBookByGoogleId(gId);

    const { id: bookId } = book;

    const existingRanking = await rankingService.getRankingByBook({
      userId,
      bookId,
    });

    if (existingRanking) {
      res.status(401).json({ message: "Book has already been ranked" });
      return;
    }

    const rankingCount = await rankingService.getRankingCountByLevel({
      userId,
      level: rankingLevel,
    });

    if (rankingCount === 0) {
      const score = await rankingService.createRankingAndGetScore({
        userId,
        rawScore: STARTING_RAW_SCORE,
        bookId,
        level: rankingLevel,
      });

      res.send({ score });
      return;
    }

    const rankingSession = await rankingSessionService.create({
      userId,
      level: rankingLevel,
      bookId,
    });

    const result = await rankingAlgoService.handleRankingSearch({
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

      const rankingSession = await rankingSessionService.getById({
        id: rankingSessionId,
        userId,
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

      const result = await rankingAlgoService.handleRankingSearch({
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

router.post("/quit", validateBody(quitRankingSchema), async (req, res) => {
  try {
    const { userId } = req.user || {};

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { sessionId } = req.body as QuitRankingInput;

    await rankingSessionService.delete({ id: sessionId, userId });

    res.send();
  } catch (err) {
    res.send();
  }
});

export default router;
