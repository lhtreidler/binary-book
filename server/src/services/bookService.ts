import { prisma } from "../lib/prisma";
import { googleBooksService } from "./googleBooksService";
import { rankingService } from "./rankingService";

const getBookDetails = async ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}) => {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
    },
    include: {
      rankings: {
        where: {
          userId,
        },
      },
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  const details = await googleBooksService.getVolumeDetails(book.googleId);

  let userScore: number | null = null;
  if (book.rankings.length) {
    userScore = await rankingService.getRankingScore(book.rankings[0]);
  }

  return { ...details, userScore };
};

const getByGoogleId = ({ googleId }: { googleId: string }) => {
  return prisma.book.findFirst({
    where: { googleId },
  });
};

export const bookService = {
  getBookDetails,
  getByGoogleId,
};
