import { prisma } from "../../lib/prisma";
import { googleBooksService } from "./googleBooksService";

const create = async ({
  userId,
  googleId,
}: {
  userId: string;
  googleId: string;
}) => {
  const book = await googleBooksService.getOrCreateBookByGoogleId(googleId);

  const ranking = await prisma.ranking.findFirst({
    where: { userId, bookId: book.id },
  });

  if (ranking) {
    throw new Error("Ranking already exists. Cannot create bookmark");
  }

  return prisma.bookmark.create({ data: { userId, bookId: book.id } });
};

const getBookmarks = ({ userId }: { userId: string }) => {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      book: true,
    },
  });
};

const remove = async ({ bookmarkId, userId }: { bookmarkId: string; userId: string }) => {
  return prisma.bookmark.deleteMany({
    where: { id: bookmarkId, userId },
  });
};

export const bookmarkService = {
  create,
  getBookmarks,
  remove,
};
