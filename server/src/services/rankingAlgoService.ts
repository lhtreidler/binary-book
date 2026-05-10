import { rankingService, rankingSessionService, STARTING_RAW_SCORE } from ".";

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
    rankingService.getBookByOffset({
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

const handleRankingSearch = async ({
  userId,
  rankingSessionId,
  bookId,
  low,
  high,
  level,
}: {
  userId: string;
  rankingSessionId?: string;
  bookId: string;
  low: number;
  high: number;
  level: number;
}) => {
  if (low >= high) {
    const score = await createFinalRankingAndReturnScore({
      insertionIndex: low,
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

  const skip = Math.floor((low + high) / 2);

  const rankingToCompare = await rankingService.getBookByOffset({
    skip,
    userId,
    includeBook: true,
    level,
  });

  if (!rankingToCompare) {
    throw new Error("Ranking not found");
  }

  const { book } = rankingToCompare;

  const rankingStepData = { level, low, high, bookId: book.id };

  const compareBook = { title: book.title, authors: book.authors };

  if (!rankingSessionId) {
    const {
      rankingStep: { seq },
      rankingSession: { id },
    } = await rankingSessionService.createSessionAndFirstStep({
      userId,
      ...rankingStepData,
    });

    return {
      compareBook,
      seq,
      sessionId: rankingSessionId,
    };
  }
  const rankingStep = await rankingSessionService.createNextStep({
    ...rankingStepData,
    sessionId: rankingSessionId,
    userId,
  });

  return {
    compareBook,
    seq: rankingStep.seq,
  };
};

export const rankingAlgoService = {
  handleRankingSearch,
};
