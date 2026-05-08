import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "../utils/schemas.js";
import { validateBody } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import { GoogleBookSearchResponse } from "../types/googleApi.js";

const router = Router();
router.use(authenticateToken);

const baseUrl = "https://www.googleapis.com/books/v1/";
const createQueryUrl = (q: string) =>
  `${baseUrl}volumes?q=${encodeURIComponent(q)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
const createVolumeUrl = (id: string) =>
  `${baseUrl}volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;

const formatResult = ({ items }: GoogleBookSearchResponse) => {
  return items.map((item) => {
    const {
      id,
      volumeInfo: {
        title,
        authors = [],
        imageLinks: { thumbnail },
      },
    } = item;

    return { key: id, title, authors, thumbnail };
  });
};

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query: { q },
    } = req;

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Missing query parameters" });
      return;
    }

    const cachedResult = await prisma.searchCache.findUnique({
      where: { query: q },
    });

    if (cachedResult?.jsonResult) {
      res.json(JSON.parse(cachedResult.jsonResult));
    }

    const books = (await fetch(createQueryUrl(q)).then((response) =>
      response.json(),
    )) as GoogleBookSearchResponse;

    console.log({ books });
    const items = formatResult(books);

    res.json({ items });

    await prisma.searchCache.create({
      data: { query: q, jsonResult: JSON.stringify({ items }) },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch books. Please try again later." });
  }
});

export default router;
