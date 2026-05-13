import { Bookmark } from "../../generated/prisma/client";
import { BookmarkCreateArgs } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const create = async (data: Pick<Bookmark, "bookId" | "userId">) => {
  const ranking = await prisma.ranking.findFirst({
    where: data,
  });

  if (ranking) {
    throw new Error("Ranking already exists. Cannot create bookmark");
  }

  return prisma.bookmark.create({
    data,
  });
};

export const bookmarkService = {
  create,
};
