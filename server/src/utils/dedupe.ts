import { GoogleBooksVolume } from "../types/googleApi";

const normalize = (str: string) => str.trim().toLowerCase();

export const createBookComparisonStr = (title: string, authors?: string[]) => {
  return `title:${normalize(title)}+authors:${(authors || []).map(normalize).sort().join(",")}`;
};

export const dedupeBooks = (books: GoogleBooksVolume[]) => {
  const sortedWithIndex = books
    .map((book, i) => ({ ...book, bookIndex: i }))
    .sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));

  const bookSet = new Set();
  const idSet = new Set();

  const dedupedBooks = sortedWithIndex.filter((book) => {
    const compareStr = createBookComparisonStr(
      book.volumeInfo.title,
      book.volumeInfo.authors,
    );
    console.log({ compareStr, bookSet });
    if (bookSet.has(compareStr) || idSet.has(book.id)) return null;
    console.log("Unique!", compareStr);
    idSet.add(book.id);
    bookSet.add(compareStr);
    return book;
  });

  const toReturn = dedupedBooks
    .sort((a, b) => a.bookIndex - b.bookIndex)
    .map(({ bookIndex: _i, ...rest }) => rest);

  console.log("Starting", sortedWithIndex.length, "Ending", toReturn.length);

  return toReturn;
};
