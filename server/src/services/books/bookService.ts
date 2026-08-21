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
  try {
    console.log({ userId, bookId });
    const book = await prisma.book.findFirst({
      // `id` is a Postgres uuid column, so it can only be queried when
      // bookId looks like a UUID -- otherwise Postgres rejects the value
      // before evaluating the OR.
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

    console.log({ book });

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
  } catch (err) {
    console.log(err);
  }
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
