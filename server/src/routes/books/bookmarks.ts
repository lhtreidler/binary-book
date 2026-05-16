import { Router, Request, Response } from "express";
import { authenticateToken } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validation.js";
import { createBookmarkSchema, CreateBookmarkInput } from "../../utils/schemas.js";
import { bookmarkService } from "../../services/books/bookmarkService.js";

const router = Router();
router.use(authenticateToken);

router.post(
  "/",
  validateBody(createBookmarkSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user || {};
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { apiId } = req.body as CreateBookmarkInput;

    try {
      const bookmark = await bookmarkService.create({
        userId,
        googleId: apiId,
      });
      res.json(bookmark);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      res.status(500).json({ error: message });
    }
  },
);

router.delete(
  "/:bookmarkId",
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user || {};
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { bookmarkId } = req.params;

    try {
      await bookmarkService.remove({ bookmarkId, userId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
