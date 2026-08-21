import { prisma } from "../../lib/prisma";
import { googleBooksService } from "./googleBooksService";
import { rankingService } from "../rankings/rankingService";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getBookDetailsByIdOrGoogleId = async ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}) => {
  const book = await prisma.book.findFirst({
    where: UUID_REGEX.test(bookId)
      ? { OR: [{ id: bookId }, { googleId: bookId }] }
      : { googleId: bookId },
    include: {
      rankings: {
        where: {
          userId,
        },
      },
      bookmarks: {
        where: {
          userId,
        },
      },
      tags: true,
    },
  });

  const { categories: _categories, ...details } =
    (await googleBooksService.getVolumeDetails(
      book ? book.googleId : bookId,
    )) || {};

  let userScore: number | null = null;
  if (book && book.rankings.length) {
    userScore = await rankingService.getRankingScore(book.rankings[0]);
  }

  if (!details && !book) {
    throw new Error("Unavailable");
  }

  return {
    ...details,
    userScore,
    bookmarkId: (book && book.bookmarks[0]?.id) ?? null,
    tags: book ? book.tags.map((tag) => tag.name) : [],
  };
};

const getByGoogleId = ({ googleId }: { googleId: string }) => {
  return prisma.book.findFirst({
    where: { googleId },
  });
};

export const bookService = {
  getBookDetailsByIdOrGoogleId,
  getByGoogleId,
};
