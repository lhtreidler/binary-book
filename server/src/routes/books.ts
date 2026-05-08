import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { queryGoogleBooks } from "../lib/thirdParty.js";
import {
  calculateScore,
  getHighestLowestScores,
} from "../utils/rankingHelpers.js";

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
    const items = await queryGoogleBooks(q);

    // get matching books from user's shelf by google id
    const googleIds = items.map(({ key }) => key);

    const rankedBooks = await prisma.book.findMany({
      where: {
        rankings: {
          some: {
            userId,
          },
        },
        googleId: {
          in: googleIds,
        },
      },
    });

    const formattedItems = items.map((item) => {
      return {
        ...item,
        isRanked: rankedBooks.some(({ googleId }) => googleId === item.key),
      };
    });

    res.json({ items: formattedItems });
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

    const userId = req.user.userId;

    const PAGE_SIZE = 5;

    const skip = (page - 1) * PAGE_SIZE;

    const rankingsPlusOne = await prisma.ranking.findMany({
      where: {
        userId,
      },
      include: {
        book: true,
      },
      skip,
      take: PAGE_SIZE + 1,
      orderBy: { rawScore: "desc" },
    });

    const rankings = rankingsPlusOne.slice(0, PAGE_SIZE);
    const hasNextPage = rankingsPlusOne.length > PAGE_SIZE;

    const levelsToGet = Array.from(
      new Set(rankings.map(({ level }) => level)),
    ).filter((level) => level !== null);

    const levelMinMax = await Promise.all(
      levelsToGet.map(async (level) => {
        const minMax = await getHighestLowestScores(userId, level);
        return {
          level,
          ...minMax,
        };
      }),
    );

    const formattedList = rankings
      .map(({ book: { title, authors }, level, rawScore }) => {
        const minMax = levelMinMax.find((m) => m.level === level);
        if (!minMax || rawScore === null) return null;

        return {
          title,
          authors,
          score: calculateScore({ rawScore, ...minMax }),
        };
      })
      .filter((b) => !!b);

    res.json({
      list: formattedList,
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch list. Please try again later." });
  }
});

export default router;
