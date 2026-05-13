import {
  FormattedBookItems,
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
} from "../../types/googleApi";
import { createBookComparisonStr, dedupeBooks } from "../../utils/dedupe";
import { stripHtml } from "../../utils/html";
import { prisma } from "../../lib/prisma";
import { searchCacheService } from "./searchCacheService";

const baseUrl = "https://www.googleapis.com/books/v1/volumes";

const createQueryUrl = (q: string) =>
  `${baseUrl}?q=${encodeURIComponent(q)}&projection=lite&printType=books&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

const createVolumeUrl = (id: string) =>
  `${baseUrl}/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;

const fetchBooks = async (query: string): Promise<FormattedBookItems> => {
  const books = (await fetch(createQueryUrl(query)).then((response) =>
    response.json(),
  )) as GoogleBooksSearchResponse;

  return (books.items || []).map(
    ({ id, volumeInfo: { title, authors = [], imageLinks } }) => ({
      key: id,
      title,
      authors,
      thumbnail: imageLinks?.thumbnail,
      compareStr: createBookComparisonStr(title, authors),
    }),
  );
};

const queryBooks = async ({
  userId,
  query,
}: {
  userId: string;
  query: string;
}) => {
  const cachedResult = await searchCacheService.getByQuery({ query });

  let result: FormattedBookItems = [];
  if (cachedResult?.jsonResult) {
    result = JSON.parse(cachedResult.jsonResult) as FormattedBookItems;
  } else {
    result = await fetchBooks(query);
    await searchCacheService.create({ query, result });
  }

  // get matching books from user's shelf by google id
  let googleIds: string[] = [];
  let comparisonStrings: string[] = [];

  result.forEach(({ key, compareStr }) => {
    googleIds.push(key);
    comparisonStrings.push(compareStr);
  });

  // find books the user has ranked with the same comparison string or googleId
  const compareOr = [
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
  ];

  const existingData = await prisma.book.findMany({
    where: {
      OR: compareOr,
    },
    include: {
      rankings: {
        where: {
          userId,
        },
      },
      bookmarks: {
        where: { userId },
      },
    },
  });

  const compareStrSet = new Set<string>();

  const bookData = result
    .map((res) => {
      const bookCompareStr = res.compareStr;

      const matchedBook =
        existingData.find(({ googleId }) => googleId === res.key) ||
        existingData.find(({ compareStr }) => compareStr === bookCompareStr);

      if (matchedBook) {
        compareStrSet.add(bookCompareStr);

        const { id: _id, googleId, rankings, bookmarks, ...rest } = matchedBook;

        return {
          key: googleId,
          isRanked: !!rankings.length,
          isBookmarked: !!bookmarks.length,
          ...rest,
        };
      }

      if (compareStrSet.has(bookCompareStr)) {
        return null;
      }

      compareStrSet.add(bookCompareStr);

      return {
        ...res,
        isRanked: false,
        isBookmarked: false,
      };
    })
    .filter((n) => !!n);

  return bookData;
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
  queryGoogleBooks: queryBooks,
  getOrCreateBookByGoogleId,
  getVolumeDetails,
  fetchBooks,
};
