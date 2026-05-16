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

    const { rankingLevel, apiId } = req.body as StartRankingInput;

    const book = await googleBooksService.getOrCreateBookByGoogleId(apiId);

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
      const result = await rankingService.createRankingAndGetScore({
        userId,
        rawScore: STARTING_RAW_SCORE,
        bookId,
        level: rankingLevel,
      });

      res.send(result);
      return;
    }

    const result = await rankingAlgoService.handleRankingSearch({
      userId,
      bookId,
      low: 0,
      high: rankingCount,
      level: rankingLevel,
    });

    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 1. Take in the rankingStepId & get it
 * 2. Delete all steps where seq > current seq
 * 3. Create new ranking step
 *
 */

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

      const { seq, sessionId, selection } = req.body as ContinueRankingInput;

      const result = await rankingAlgoService.handleContinueRanking({
        userId,
        rankingSessionId: sessionId,
        seq,
        selection,
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
