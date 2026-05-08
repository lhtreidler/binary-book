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
  `${baseUrl}/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;

export const formatResult = (res: GoogleBooksSearchResponse) => {
  if (!res.items) return [];

  const keySet = new Set();
  return res.items.reduce<FormattedBookItem>((acc, item) => {
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
  const formattedQuery = JSON.stringify(q).toLowerCase();
  const cachedResult = await prisma.searchCache.findFirst({
    where: { query: formattedQuery },
  });

  if (cachedResult?.jsonResult) {
    return formatResult(
      JSON.parse(cachedResult.jsonResult) as GoogleBooksSearchResponse,
    );
  }

  const books = (await fetch(createQueryUrl(q)).then((response) =>
    response.json(),
  )) as GoogleBooksSearchResponse;

  try {
    await prisma.searchCache.create({
      data: {
        query: formattedQuery,
        jsonResult: JSON.stringify({ items: books.items }),
      },
    });
  } catch (err) {
    console.error(err);
  }

  return formatResult(books);
};

export const getOrCreateBook = async (volumeId: string) => {
  const existingBook = await prisma.book.findFirst({
    where: { googleId: volumeId },
  });

  if (existingBook) {
    return existingBook;
  }

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

  const createdBook = await prisma.book.create({
    data: {
      googleId: volumeId,
      title,
      authors,
    },
  });

  return createdBook;
};

export type VolumeDetails = {
  googleId: string;
  title: string | null;
  authors: string[];
  thumbnail: string | null;
  description: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  categories: string[];
};

export const getVolumeDetails = async (
  volumeId: string,
): Promise<VolumeDetails> => {
  const volume = (await fetch(createVolumeUrl(volumeId)).then((response) =>
    response.json(),
  )) as GoogleBooksVolume;

  if (!volume || !volume.id) {
    throw new Error("Could not find book");
  }

  const { volumeInfo } = volume;

  const rawThumbnail = volumeInfo?.imageLinks?.thumbnail ?? null;

  return {
    googleId: volume.id,
    title: volumeInfo?.title ?? null,
    authors: volumeInfo?.authors ?? [],
    thumbnail: rawThumbnail ? rawThumbnail.replace(/^http:/, "https:") : null,
    description:
      typeof volumeInfo?.description === "string"
        ? volumeInfo.description
        : null,
    publishedDate: volumeInfo?.publishedDate ?? null,
    pageCount: typeof volumeInfo?.pageCount === "number"
      ? volumeInfo.pageCount
      : null,
    categories: volumeInfo?.categories ?? [],
  };
};
