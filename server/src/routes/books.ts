import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { googleBooksService, rankingService } from "../services";
import { bookService } from "../services";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const {
    query: { q },
  } = req;

  if (!req.user || !req.user.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { userId } = req.user;

  if (!q || typeof q !== "string") {
    res.status(400).json({ message: "Missing query parameters" });
    return;
  }

  try {
    const items = await googleBooksService.queryGoogleBooks({
      query: q,
      userId,
    });

    res.json({ items });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch books. Please try again later." });
  }
});

router.get("/list", async (req: Request, res: Response) => {
  try {
    const { query } = req;

    let page = Number(query.page);

    if (Number.isNaN(page)) {
      page = 1;
    }

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await rankingService.getPaginatedRankingsByUser({
      userId: req.user.userId,
      page,
    });

    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch list. Please try again later." });
  }
});

router.get(
  "/details/:bookId",
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId } = req.user;
    const { bookId } = req.params;

    if (!bookId) {
      res.status(400).json({ message: "Missing bookId" });
      return;
    }

    try {
      const details = await bookService.getBookDetails({ userId, bookId });

      res.json(details);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch book details." });
    }
  },
);

export default router;
