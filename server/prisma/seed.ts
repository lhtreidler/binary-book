import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Book, PrismaClient, Ranking } from "../src/generated/prisma/client";
import { faker } from "@faker-js/faker";
import * as fs from "node:fs";
import {
  authService,
  googleBooksService,
  STARTING_RAW_SCORE,
} from "../src/services";
import { formatUsername } from "../src/utils/format";
import bookData from "./data.json";
import { FormattedBookItems } from "../src/types/googleApi";
import { createBookComparisonStr } from "../src/utils/dedupe";
import { parseArgs } from "node:util";

const RANKING_MIN = 10;

const options = {
  userCount: { type: "string", default: "100" },
  bookCount: { type: "string", default: "200" },
  useJsonData: { type: "boolean", default: true },
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

const createRankings = (userId: string, booksIds: string[]) => {
  let booksRemaining = new Set(booksIds);
  const length = getRandom(RANKING_MIN, booksIds.length - 1);
  console.log(`Creating ${length} rankings for ${userId}`);
  const gap = 100;

  const levelToRankings = {
    0: [],
    1: [],
    2: [],
  } as Record<number, Pick<Ranking, "bookId" | "rawScore">[]>;

  for (let i = 0; i < length; i++) {
    const bookIdIndex = getRandom(0, booksRemaining.size - 1);
    const bookId = Array.from(booksRemaining)[bookIdIndex];

    booksRemaining.delete(bookId);
    const level = getRandom(0, 2);

    const existingRankings = levelToRankings[level];

    let rawScore = STARTING_RAW_SCORE;
    const rankingIndex = getRandom(0, Math.max(0, existingRankings.length - 1));
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

  return Object.entries(levelToRankings).flatMap(([level, rankings]) => {
    return rankings.map((ranking) => ({
      userId,
      level: Number(level),
      ...ranking,
    }));
  });
};

const createUser = (i: number) => {
  const name = {
    firstName: faker.person.firstName(),
    ...(Math.random() > 0.2 ? { lastName: faker.person.lastName() } : {}),
  };

  return {
    username: formatUsername(faker.internet.username(name)),
    email: `leahtreidler+${i}@gmail.com`,
    ...name,
  };
};

const fetchBooks = async (bookCount: number) => {
  fs.accessSync(filePath);

  // get books from google data if bookData is not stored already
  const books: FormattedBookItems = [];
  const googleIds = new Set();

  while (books.length < bookCount) {
    console.log("Book length:", books.length);
    const bookTitle = faker.book.title();
    const result = await googleBooksService.fetchBooks(bookTitle);
    if (result.length) {
      const res =
        result.find(({ title }) =>
          title.toLowerCase().includes(bookTitle.toLowerCase()),
        ) || result[0];

      if (!googleIds.has(res.key)) {
        googleIds.add(res.key);
        books.push(res);
      }
    }
  }

  const allBooks = books
    .filter((n) => !!n)
    .map(({ key, ...data }) => ({
      googleId: key,
      compareStr: createBookComparisonStr(data.title, data.authors),
      ...data,
    }));

  fs.writeFileSync(filePath, JSON.stringify(allBooks));

  return allBooks;
};

const createFollows = async (userIds: string[]) => {
  const toCreate = userIds.flatMap((userId) => {
    const [numFollowers, numFollowing] = createArray(2, () =>
      getRandom(0, userIds.length - 1),
    );
    const filteredIds = userIds.filter((id) => id !== userId);
    const remainingFollowerIds = new Set(filteredIds);
    const remainingFollowingIds = new Set(filteredIds);

    const followers = [];
    const following = [];

    for (let i = 0; i < Math.max(numFollowers, numFollowing); i++) {
      if (i <= numFollowers) {
        const index = getRandom(0, remainingFollowerIds.size - 1);
        const curr = Array.from(remainingFollowerIds.values())[index];
        followers.push({ toId: userId, fromId: curr });
        remainingFollowerIds.delete(curr);
      }

      if (i <= numFollowing) {
        const index = getRandom(0, remainingFollowingIds.size - 1);
        const curr = Array.from(remainingFollowingIds.values())[index];
        following.push({ toId: curr, fromId: userId });
        remainingFollowingIds.delete(curr);
      }
    }

    return [...followers, ...following];
  });

  return prisma.follow.createManyAndReturn({ data: toCreate });
};

async function main() {
  const { values } = parseArgs({ options });

  const userCount = Number(values.userCount);
  const bookCount = Number(values.bookCount);
  const useJsonData = values.useJsonData;

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

  const rankingsToCreate = createdUsers.flatMap(({ id }) =>
    createRankings(
      id,
      createdBooks.map(({ id }) => id),
    ),
  );

  await prisma.ranking.createMany({ data: rankingsToCreate });
  console.log(`Created ${rankingsToCreate.length} rankings`);

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
