import { prisma } from "../../lib/prisma";
import { splitTags } from "../../utils/format";

const connectOrCreateTags = async ({
  bookId,
  categories,
}: {
  bookId: string;
  categories: string[];
}) => {
  if (!categories || !categories.length) return [];

  const books = { connect: [{ id: bookId }] };

  // Group children by parent name, deduping both parents and children since
  // tag names are globally unique and multiple categories can share a parent.
  const parentToChildren = new Map<string, Set<string>>();
  for (const category of categories) {
    const [parent, ...children] = splitTags(category);
    const childSet = parentToChildren.get(parent) ?? new Set<string>();
    for (const child of children) childSet.add(child);
    parentToChildren.set(parent, childSet);
  }

  const parents = await Promise.all(
    Array.from(parentToChildren.keys()).map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: { books },
        create: { name, books },
      }),
    ),
  );

  const childUpserts: Promise<unknown>[] = [];
  const seenChildren = new Set<string>();
  parents.forEach((parent) => {
    const children = parentToChildren.get(parent.name) ?? new Set<string>();
    for (const name of children) {
      if (seenChildren.has(name)) continue;
      seenChildren.add(name);
      childUpserts.push(
        prisma.tag.upsert({
          where: { name },
          update: { books, parentTagId: parent.id },
          create: { name, books, parentTagId: parent.id },
        }),
      );
    }
  });
  const children = await Promise.all(childUpserts);

  return [...parents, ...children];
};

export const tagService = {
  connectOrCreateTags,
};
