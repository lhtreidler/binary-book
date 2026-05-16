import {
  FormattedBookItem,
  FormattedBookItems,
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
} from "../../types/googleApi";
import { createBookComparisonStr } from "../../utils/dedupe";
import { stripHtml } from "../../utils/html";
import { prisma } from "../../lib/prisma";
import { searchCacheService } from "./searchCacheService";
import { appendPath, appendSearchParams, buildUrl } from "../../utils/requests";
import { handlePaginatedRequest } from "../../utils/pagination";

const apiUrl = buildUrl("https://www.googleapis.com/books/v1/volumes", {
  key: process.env.GOOGLE_BOOKS_API_KEY,
});

const createQueryUrl = (q: string) =>
  appendSearchParams(new URL(apiUrl), {
    q,
    projection: "lite",
    printType: "books",
    maxResults: "40",
  });

const createVolumeUrl = (id: string) => appendPath(new URL(apiUrl), id);

const fetchBooks = async (
  query: string,
  maxRetries = 1,
): Promise<FormattedBookItems> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(createQueryUrl(query));

    if (response.status === 429) {
      if (attempt === maxRetries) {
        throw new Error("Rate limit exceeded after max retries");
      }
      const delay = 1000 * Math.pow(2, attempt);
      console.log(
        `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Google Books API error ${response.status}: ${body.slice(0, 300)}`,
      );
    }

    const books = (await response.json()) as GoogleBooksSearchResponse;
    return (books.items || []).map(
      ({ id, volumeInfo: { title, authors = [], imageLinks } }) => {
        const raw = imageLinks?.thumbnail;
        return {
          apiId: id,
          title,
          authors,
          thumbnail: raw ? raw.replace(/^http:/, "https:") : undefined,
          compareStr: createBookComparisonStr(title, authors),
        };
      }
    );
  }

  return [];
};

const queryBooks = async ({
  userId,
  query,
  page = 1,
}: {
  userId: string;
  query: string;
  page?: number;
}) => {
  const cachedResult = await searchCacheService.getByQuery({ query });

  let result: FormattedBookItems = cachedResult ? cachedResult.jsonResult : [];
  if (!cachedResult) {
    result = await fetchBooks(query);
    await searchCacheService.create({ query, result });
  }

  // get matching books from user's shelf by google id
  let googleIds: string[] = [];
  let comparisonStrings: string[] = [];

  result.forEach(({ apiId, compareStr }) => {
    googleIds.push(apiId);
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

  const compareStrMap: Record<
    string,
    FormattedBookItem & {
      id: string | null;
      isRanked: boolean;
      bookmarkId: string | null;
      orderIndex: number;
    }
  > = {};

  result.forEach((res, orderIndex) => {
    const bookCompareStr = res.compareStr;

    const matchedBook =
      existingData.find(({ googleId }) => googleId === res.apiId) ||
      existingData.find(({ compareStr }) => compareStr === bookCompareStr);

    const existingInSet = compareStrMap[bookCompareStr];

    if (
      (matchedBook && (existingInSet?.isRanked || existingInSet?.bookmarkId)) ||
      (!matchedBook && !!existingInSet)
    ) {
      return;
    }

    if (matchedBook) {
      const { id, googleId, rankings, bookmarks, ...rest } = matchedBook;

      compareStrMap[bookCompareStr] = {
        ...rest,
        ...res,
        id,
        apiId: googleId,
        isRanked: !!rankings.length,
        bookmarkId: bookmarks[0]?.id ?? null,
        orderIndex,
      };
    } else {
      compareStrMap[bookCompareStr] = {
        ...res,
        id: null,
        isRanked: false,
        bookmarkId: null,
        orderIndex,
      };
    }
  });

  const allItems = Object.values(compareStrMap)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(({ orderIndex: _i, ...rest }) => rest);

  const { result: items, nextPage } = await handlePaginatedRequest({
    page,
    callback: async ({ skip, take }) => allItems.slice(skip, skip + take),
  });

  return { items, nextPage };
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
  apiId: string;
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
    apiId: volume.id,
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
