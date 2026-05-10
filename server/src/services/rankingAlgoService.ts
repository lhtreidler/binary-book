import {
  rankingService,
  rankingSessionService,
  rankingStepService,
  STARTING_RAW_SCORE,
} from ".";
import { rankingSelection, RankingSelection } from "../utils/schemas";

const createFinalRankingAndReturnScore = async ({
  insertionIndex,
  userId,
  level,
  bookId,
}: {
  insertionIndex: number;
  userId: string;
  level: number;
  bookId: string;
}) => {
  const totalCount = await rankingService.getRankingCountByLevel({
    userId,
    level,
  });

  let rawScore: number;

  const getBook = async (skip: number) =>
    rankingService.getRankingByOffset({
      skip,
      userId,
      includeBook: false,
      level,
    });

  if (insertionIndex === 0) {
    const [lowest, secondLowest] = await Promise.all([
      getBook(0),
      totalCount > 1 ? getBook(1) : null,
    ]);

    if (!lowest || lowest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondLowest?.rawScore != null
        ? secondLowest.rawScore - lowest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = lowest.rawScore - gap;
  } else if (insertionIndex === totalCount) {
    const [highest, secondHighest] = await Promise.all([
      getBook(totalCount - 1),
      totalCount > 1 ? getBook(totalCount - 2) : null,
    ]);
    if (!highest || highest.rawScore === null) {
      throw new Error("Could not find rankings");
    }
    const gap =
      secondHighest?.rawScore != null
        ? highest.rawScore - secondHighest.rawScore
        : STARTING_RAW_SCORE;
    rawScore = highest.rawScore + gap;
  } else {
    const [lowRanking, highRanking] = await Promise.all(
      [insertionIndex - 1, insertionIndex].map(getBook),
    );
    if (
      !lowRanking ||
      lowRanking.rawScore === null ||
      !highRanking ||
      highRanking.rawScore === null
    ) {
      throw new Error("Could not find rankings");
    }
    rawScore = (lowRanking.rawScore + highRanking.rawScore) / 2;
  }

  const { score } = await rankingService.createRankingAndGetScore({
    userId,
    rawScore,
    bookId,
    level,
  });

  return score;
};

const handleContinueRanking = async ({
  userId,
  rankingSessionId,
  seq,
  selection,
}: {
  userId: string;
  rankingSessionId: string;
  seq: number;
  selection: RankingSelection;
}) => {
  const { rankingSession, ...rankingStep } =
    await rankingStepService.getStepAndDeleteNext({
      seq,
      rankingSessionId,
      userId,
    });

  const { low, high, skippedOffsets } = rankingStep;

  const avg = Math.floor((low + high) / 2);

  let offset: number | undefined;
  let newLow = low;
  let newHigh = high;

  if (selection === rankingSelection.skip) {
    const numSkips = skippedOffsets.length;
    if (!numSkips) {
      offset = avg - 1;
    } else {
      const diff =
        (1 + Math.floor(numSkips / 2)) * (numSkips % 2 === 0 ? -1 : 1);
      offset = avg + diff;
    }
  } else {
    const choseNew = selection === rankingSelection.new;
    newLow = choseNew ? avg + 1 : low;
    newHigh = choseNew ? high : avg;
  }

  return rankingAlgoService.handleRankingSearch({
    userId,
    rankingSessionId,
    bookId: rankingSession.bookId,
    low: newLow,
    high: newHigh,
    level: rankingSession.level,
    offset,
  });
};

const handleRankingSearch = async ({
  userId,
  rankingSessionId,
  bookId,
  low,
  high,
  level,
  offset,
}: {
  userId: string;
  rankingSessionId?: string;
  bookId: string;
  low: number;
  high: number;
  level: number;
  offset?: number;
}) => {
  const avg = Math.floor((low + high) / 2);

  if (
    low >= high ||
    (offset !== undefined && (offset <= low || offset >= high))
  ) {
    const score = await createFinalRankingAndReturnScore({
      insertionIndex: avg,
      userId,
      level,
      bookId,
    });

    // Clean up the ranking session if it was created
    if (rankingSessionId) {
      await rankingSessionService.delete({ id: rankingSessionId, userId });
    }

    // Return the final score and no further comparisons needed
    return { score, bookId };
  }

  const skip = offset === undefined ? avg : offset;

  const rankingToCompare = await rankingService.getRankingByOffset({
    skip,
    userId,
    includeBook: true,
    level,
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  const { book } = rankingToCompare;

  const rankingStepData = { low, high };

  const compareBook = { title: book.title, authors: book.authors };

  if (!rankingSessionId) {
    const {
      rankingSession: { id },
    } = await rankingSessionService.createSessionAndFirstStep({
      userId,
      level,
      bookId,
      ...rankingStepData,
    });

    return {
      compareBook,
      sessionId: id,
    };
  }

  if (offset === undefined) {
    await rankingSessionService.createNextStep({
      ...rankingStepData,
      rankingSessionId,
      userId,
    });
  } else {
    await rankingSessionService.addSkippedOffset({
      rankingSessionId,
      userId,
      offset,
    });
  }

  return {
    compareBook,
  };
};

export const rankingAlgoService = {
  handleRankingSearch,
  handleContinueRanking,
};
