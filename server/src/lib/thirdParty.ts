import {
  FormattedBookItem,
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
} from "../types/googleApi";
import { prisma } from "./prisma";

const baseUrl = "https://www.googleapis.com/books/v1/volumes";
const createQueryUrl = (q: string) =>
  `${baseUrl}?q=${encodeURIComponent(q)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
const createVolumeUrl = (id: string) =>
  `${baseUrl}/${id}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

export const formatResult = ({ items }: GoogleBooksSearchResponse) => {
  const keySet = new Set();
  return items.reduce<FormattedBookItem>((acc, item) => {
    const {
      id,
      volumeInfo: {
        title,
        authors = [],
        imageLinks: { thumbnail },
      },
    } = item;

    if (keySet.has(id)) return acc;

    keySet.add(id);
    return [...acc, { key: id, title, authors, thumbnail }];
  }, []);
};

export const queryGoogleBooks = async (q: string) => {
  const cachedResult = await prisma.searchCache.findUnique({
    where: { query: q.toLowerCase() },
  });

  if (cachedResult?.jsonResult) {
    console.log("Found in cache!");
    return JSON.parse(cachedResult.jsonResult) as FormattedBookItem;
  }

  const books = (await fetch(createQueryUrl(q)).then((response) =>
    response.json(),
  )) as GoogleBooksSearchResponse;

  return formatResult(books);
};

export const getGoogleBook = async (volumeId: string) => {
  const book = (await fetch(createVolumeUrl(volumeId)).then((response) =>
    response.json(),
  )) as GoogleBooksVolume;

  if (!book || !book.id) {
    throw new Error("Could not find book");
  }

  const {
    id,
    volumeInfo: { title, authors = [] },
  } = book;

  return {
    googleId: id,
    title,
    authors,
  };
};
