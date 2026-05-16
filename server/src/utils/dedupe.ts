import { FormattedBookItems } from "../types/googleApi";

const normalize = (str: string) => str.trim().toLowerCase();

export const createBookComparisonStr = (title: string, authors?: string[]) => {
  return `title:${normalize(title)}+authors:${(authors || []).map(normalize).sort().join(",")}`;
};

export const dedupeBooks = (googleBooks: FormattedBookItems) => {
  const sortedWithIndex = googleBooks
    .map((book, i) => ({ ...book, bookIndex: i }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const bookSet = new Set();
  const idSet = new Set();

  const dedupedBooks = sortedWithIndex.filter((book) => {
    const compareStr = createBookComparisonStr(book.title, book.authors);
    if (bookSet.has(compareStr) || idSet.has(book.apiId)) return null;
    idSet.add(book.apiId);
    bookSet.add(compareStr);
    return { ...book, compareStr };
  });

  const toReturn = dedupedBooks
    .sort((a, b) => a.bookIndex - b.bookIndex)
    .map(({ bookIndex: _i, ...rest }) => rest);

  return toReturn;
};
