import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { FormattedBookItem } from "../types/googleApi.js";
import { queryGoogleBooks } from "../lib/thirdParty.js";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  let items: FormattedBookItem = [];
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

  try {
    await prisma.searchCache.create({
      data: {
        query: JSON.stringify(q).toLowerCase(),
        jsonResult: JSON.stringify({ items }),
      },
    });
  } catch (err) {
    console.error(err);
  }
});

export default router;
