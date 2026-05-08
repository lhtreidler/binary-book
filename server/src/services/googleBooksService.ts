import {
  FormattedBookItem,
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
} from "../types/googleApi";
import { createBookComparisonStr, dedupeBooks } from "../utils/dedupe";
import { stripHtml } from "../utils/html";
import { prisma } from "../lib/prisma";

const baseUrl = "https://www.googleapis.com/books/v1/volumes";

const createQueryUrl = (q: string) =>
  `${baseUrl}?q=${encodeURIComponent(q)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

const createVolumeUrl = (id: string) =>
  `${baseUrl}/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;

const formatResult = (res: GoogleBooksSearchResponse) => {
  if (!res.items) return [];

  return dedupeBooks(res.items).reduce<FormattedBookItem>((acc, item) => {
    const {
      id,
      volumeInfo: { title, authors = [] },
    } = item;

    return [...acc, { key: id, title, authors }];
  }, []);
};

const queryGoogleBooks = async ({
  userId,
  query,
}: {
  userId: string;
  query: string;
}) => {
  const formattedQuery = JSON.stringify(query).toLowerCase();
  const cachedResult = await prisma.searchCache.findFirst({
    where: { query: formattedQuery },
  });

  if (cachedResult?.jsonResult) {
    return formatResult(
      JSON.parse(cachedResult.jsonResult) as GoogleBooksSearchResponse,
    );
  }

  const books = (await fetch(createQueryUrl(query)).then((response) =>
    response.json(),
  )) as GoogleBooksSearchResponse;

  const formattedResult = formatResult(books);

  try {
    await prisma.searchCache.create({
      data: {
        query: formattedQuery,
        jsonResult: JSON.stringify(formattedResult),
      },
    });
  } catch (err) {
    console.error(err);
  }

  // get matching books from user's shelf by google id
  let googleIds: string[] = [];
  let comparisonStrings: string[] = [];

  formattedResult.forEach(({ key, title, authors }) => {
    googleIds.push(key);
    comparisonStrings.push(createBookComparisonStr(title, authors));
  });

  // find books the user has ranked with the same comparison string or googleId
  const rankedBooks = await prisma.book.findMany({
    where: {
      rankings: {
        some: {
          userId,
        },
      },
      OR: [
        {
          googleId: {
            in: googleIds,
          },
        },
        {
          compareStr: {
            in: comparisonStrings,
          },
        },
      ],
    },
  });

  return formattedResult.map((item) => {
    return {
      ...item,
      isRanked: rankedBooks.some(({ googleId }) => googleId === item.key),
    };
  });
};

const getOrCreateBookByGoogleId = async (googleId: string) => {
  const existingBook = await prisma.book.findFirst({
    where: { googleId: googleId },
  });

  if (existingBook) {
    return existingBook;
  }

  const book = (await fetch(createVolumeUrl(googleId)).then((response) =>
    response.json(),
  )) as GoogleBooksVolume;

  if (!book || !book.id) {
    throw new Error("Could not find book");
  }

  const {
    id,
    volumeInfo: { title, authors = [] },
  } = book;

  const matching = await prisma.book.findFirst({
    where: { compareStr: createBookComparisonStr(title, authors) },
  });

  if (matching) {
    return matching;
  }

  const createdBook = await prisma.book.create({
    data: {
      googleId: googleId,
      title,
      authors,
      compareStr: createBookComparisonStr(title, authors),
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

const getVolumeDetails = async (volumeId: string): Promise<VolumeDetails> => {
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
        ? stripHtml(volumeInfo.description)
        : null,
    publishedDate: volumeInfo?.publishedDate ?? null,
    pageCount:
      typeof volumeInfo?.pageCount === "number" ? volumeInfo.pageCount : null,
    categories: volumeInfo?.categories ?? [],
  };
};

export const googleBooksService = {
  queryGoogleBooks,
  getOrCreateBookByGoogleId,
  getVolumeDetails,
};
