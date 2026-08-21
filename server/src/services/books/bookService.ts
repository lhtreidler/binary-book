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
    },
  });

  const details = await googleBooksService.getVolumeDetails(
    book ? book.googleId : bookId,
  );

  console.log({ details });

  let userScore: number | null = null;
  if (book && book.rankings.length) {
    userScore = await rankingService.getRankingScore(book.rankings[0]);
  }

  return {
    ...details,
    userScore,
    bookmarkId: (book && book.bookmarks[0]?.id) ?? null,
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
