import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Ranking } from "../src/generated/prisma/client";
import { faker } from "@faker-js/faker";
import * as fs from "node:fs";
import {
  authService,
  googleBooksService,
  STARTING_RAW_SCORE,
} from "../src/services";
import { formatUsername } from "../src/utils/format";
import bookData from "./data.json";
import { parseArgs } from "node:util";
import {
  BookCreateManyArgs,
  BookmarkCreateManyArgs,
  RankingCreateManyArgs,
} from "../src/generated/prisma/models";
import _ from "lodash";

const RANKING_MIN = 10;

const options = {
  userCount: { type: "string", default: "100" },
  bookCount: { type: "string", default: "200" },
  useJsonData: { type: "string", default: "true" },
} as const;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const filePath = "./prisma/data.json";

const createArray = <T>(length: number, callback: (i: number) => T) => {
  return Array.from({ length }).map((_, i) => callback(i));
};

const getRandom = (min: number, max: number) => faker.number.int({ min, max });

const createRankingsAndBookmarks = async (
  userIds: string[],
  booksIds: string[],
) => {
  const allRankings: RankingCreateManyArgs["data"] = [];
  const allBookmarks: BookmarkCreateManyArgs["data"] = [];

  for (let userId of userIds) {
    let booksRemaining = new Set(booksIds);
    const numRankings = getRandom(RANKING_MIN, Math.floor(booksIds.length / 2));
    const numBookmarks = getRandom(0, booksIds.length - numRankings);
    console.log(
      `Creating ${numRankings} rankings and ${numBookmarks} bookmarks for ${userId}`,
    );
    const gap = 100;

    const levelToRankings = {
      0: [],
      1: [],
      2: [],
    } as Record<number, Pick<Ranking, "bookId" | "rawScore">[]>;

    for (let i = 0; i < numRankings; i++) {
      const bookIdIndex = getRandom(0, booksRemaining.size - 1);
      const bookId = Array.from(booksRemaining)[bookIdIndex];

      booksRemaining.delete(bookId);
      const level = getRandom(0, 2);

      const existingRankings = levelToRankings[level];

      let rawScore = STARTING_RAW_SCORE;
      const rankingIndex = getRandom(
        0,
        Math.max(0, existingRankings.length - 1),
      );
      if (existingRankings.length > 0) {
        const higherScore = existingRankings[rankingIndex]?.rawScore;
        const lowerScore = existingRankings[rankingIndex - 1]?.rawScore;

        if (higherScore === undefined) {
          rawScore = lowerScore + gap;
        } else if (lowerScore === undefined) {
          rawScore = higherScore - gap;
        } else {
          rawScore = (higherScore + lowerScore) / 2;
        }
      }

      const updatedLevel = [...levelToRankings[level]];
      updatedLevel.splice(rankingIndex, 0, { bookId, rawScore });

      levelToRankings[level] = updatedLevel;
    }

    const bookmarks = createArray(numBookmarks, () => {
      const bookIdIndex = getRandom(0, booksRemaining.size - 1);
      const bookId = Array.from(booksRemaining)[bookIdIndex];

      booksRemaining.delete(bookId);

      return { bookId, userId };
    });

    const rankings = Object.entries(levelToRankings).flatMap(
      ([level, rankings]) => {
        return rankings.map((ranking) => ({
          userId,
          level: Number(level),
          ...ranking,
        }));
      },
    );

    allBookmarks.push(...bookmarks);
    allRankings.push(...rankings);
  }

  await Promise.all([
    prisma.bookmark.createMany({ data: allBookmarks }),
    prisma.ranking.createMany({ data: allRankings }),
  ]);
};

const createUser = (i: number) => {
  const name = {
    firstName: faker.person.firstName(),
    ...(Math.random() > 0.2 ? { lastName: faker.person.lastName() } : {}),
  };

  return {
    username: formatUsername(faker.internet.username(name)),
    email: `leahtreidler+${i}@gmail.com`,
    profileImg: faker.image.urlPicsumPhotos(),
    ...name,
  };
};

const fetchBooks = async (bookCount: number) => {
  fs.accessSync(filePath);

  // get books from google data if bookData is not stored already
  const books: BookCreateManyArgs["data"] = [];
  const googleIds = new Set();

  const CHUNK_SIZE = 5;

  while (books.length < bookCount) {
    console.log("Book length:", books.length);
    const titles = Array.from(
      new Set(createArray(bookCount - books.length, () => faker.book.title())),
    );

    const chunks = _.chunk(titles, CHUNK_SIZE);

    for (let chunk of chunks) {
      const results = await Promise.all(
        chunk.map((title) => googleBooksService.fetchBooks(title)),
      );

      const mappedResults = results
        .map((result, i) => {
          if (!result.length) return null;
          const res =
            result.find(({ title }) =>
              title.toLowerCase().includes(titles[i].toLowerCase()),
            ) || result[0];

          if (!googleIds.has(res.apiId)) {
            googleIds.add(res.apiId);
            const { apiId, ...data } = res;
            return {
              googleId: apiId,
              ...data,
            };
          }
        })
        .filter((n) => !!n);

      books.push(...mappedResults);
      fs.writeFileSync(filePath, JSON.stringify(books));
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(books));

  return books;
};

const createFollows = async (userIds: string[]) => {
  const toCreate = userIds.flatMap((userId) => {
    const filteredIds = userIds.filter((id) => id !== userId);
    const remainingIds = new Set(filteredIds);
    const numFollowing = getRandom(0, filteredIds.length - 1);

    const following = [];

    for (let i = 0; i <= numFollowing; i++) {
      const index = getRandom(0, remainingIds.size - 1);
      const curr = Array.from(remainingIds.values())[index];
      following.push({ toId: userId, fromId: curr });
      remainingIds.delete(curr);
    }

    return following;
  });

  return prisma.follow.createManyAndReturn({ data: toCreate });
};

async function main() {
  const { values } = parseArgs({ options });

  const userCount = Number(values.userCount);
  const bookCount = Number(values.bookCount);
  const useJsonData = values.useJsonData !== "false";

  console.log(
    `Options: userCount = ${userCount}, bookCount = ${bookCount}, useJsonData = ${useJsonData}`,
  );

  const booksToCreate = useJsonData ? bookData : await fetchBooks(bookCount);

  if (booksToCreate.length < RANKING_MIN) {
    throw new Error("Not enough books");
  }

  const password = "Password123";
  const passwordHash = await authService.createPasswordHash(password);

  const createdBooks = await prisma.book.createManyAndReturn({
    data: booksToCreate,
  });
  console.log(`Created ${createdBooks.length} books`);

  const createdUsers = await prisma.user.createManyAndReturn({
    data: createArray(userCount, (i) => ({ ...createUser(i), passwordHash })),
  });
  console.log(`Created ${createdUsers.length} users`);

  const createdFollows = await createFollows(createdUsers.map(({ id }) => id));
  console.log(`Created ${createdFollows.length} follows`);

  await createRankingsAndBookmarks(
    createdUsers.map(({ id }) => id),
    createdBooks.map(({ id }) => id),
  );

  console.log(`Success!`);
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
