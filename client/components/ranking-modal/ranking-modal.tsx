import { useEffect, useMemo, useState } from "react";

import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../ui/modal";
import { Pressable } from "../ui/pressable";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

import {
  BookSearchItem,
  ContinueRankingResponse,
  RankingBookInfo,
  StartRankingResponse,
  useContinueRanking,
  useStartRanking,
} from "@/lib/api";
import { FinishedRankingResponse } from "@/lib/api/types";
import { useQuitRanking } from "@/lib/api/hooks/useRanking";
import { sliceJoinArray, sliceString } from "@/lib/format-utils";
import { TierButtons, Phase, phaseToHeader } from "./constants";

const formatAuthors = (authors: string[]) =>
  authors.length ? authors.join(", ") : "Unknown Author";

const formatTitle = (title: string) => sliceString(title, 100);

const getIsFinishedRankingResponse = (
  res: any,
): res is FinishedRankingResponse => "score" in res;

export const RankingModal = ({
  book,
  isOpen,
  onClose,
}: {
  book: BookSearchItem | null;
  isOpen: boolean;
  onClose: (bookId?: string) => void;
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<RankingBookInfo[]>([]);
  const [result, setResult] = useState<FinishedRankingResponse | null>(null);

  const bookToCompare = comparisons[comparisons.length - 1];

  const phase: Phase = useMemo(() => {
    if (result) return "score";
    if (comparisons.length) return "comparing";
    return "tier";
  }, [result, comparisons]);

  const startMutation = useStartRanking();
  const continueMutation = useContinueRanking();
  const quitRanking = useQuitRanking();

  console.log(error);

  const applyResult = (res: StartRankingResponse | ContinueRankingResponse) => {
    console.log(res);
    if ("sessionId" in res) {
      setSessionId(res.sessionId);
    }

    if (getIsFinishedRankingResponse(res)) {
      setResult(res);
    } else {
      setComparisons((prev) => [...prev, res.compareBook]);
    }
  };

  const handleTierPick = async (level: number) => {
    if (!book) return;
    setError(null);
    try {
      const result = await startMutation.mutateAsync({
        rankingLevel: level,
        gId: book.key,
      });

      applyResult(result);
    } catch {
      setError("Could not start ranking. Please try again.");
    }
  };

  const handleChoice = async (choseNew: boolean) => {
    if (!sessionId) return;
    setError(null);
    try {
      const result = await continueMutation.mutateAsync({
        sessionId,
        choseNew,
        seq: comparisons.length,
      });
      console.log({ result });
      applyResult(result);
    } catch {
      setError("Could not continue ranking. Please try again.");
    }
  };

  const onCloseModal = () => {
    setResult(null);
    setComparisons([]);
    setSessionId(null);
    setError(null);
    if (sessionId && !result) {
      quitRanking.mutate({ sessionId });
    }

    onClose((result && result.bookId) || undefined);
  };

  const isLoading = startMutation.isPending || continueMutation.isPending;

  const getContent = () => {
    if (phase === "tier" && !result && book) {
      return (
        <>
          <Text className="mb-1 text-lg font-semibold text-center">
            {book.title}
          </Text>
          <Text className="text-center mb-4">
            by {formatAuthors(book.authors)}
          </Text>
          <VStack space="sm">
            {TierButtons.map((tier) => (
              <Button
                key={tier.value}
                onPress={() => handleTierPick(tier.value)}
                isDisabled={isLoading}
                className={tier.className}
              >
                <ButtonText>{tier.label}</ButtonText>
              </Button>
            ))}
          </VStack>
        </>
      );
    }

    if (phase === "comparing" && bookToCompare) {
      return (
        <>
          <HStack space="md" className="items-center justify-center">
            {[
              { ...book, isNew: true },
              { ...bookToCompare, isNew: false },
            ].map(({ title, authors = [], isNew }, i) => (
              <>
                <Pressable
                  key={title}
                  onPress={() => handleChoice(isNew)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Box className="h-full p-2 border border-gray-300 rounded-md justify-center items-center bg-slate-50">
                    <Text className="font-bold text-center">
                      {formatTitle(title || "")}
                    </Text>
                    {authors.length > 0 && (
                      <Text className="mt-2 text-sm text-center">
                        {sliceJoinArray(authors, 30)}
                      </Text>
                    )}
                  </Box>
                </Pressable>
                {i === 0 && <Text className="font-bold">OR</Text>}
              </>
            ))}
          </HStack>
        </>
      );
    }

    if (phase === "score" && result) {
      return (
        <>
          <Text className="text-5xl text-center font-bold">
            {result.score.toFixed(1)}
          </Text>
        </>
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalBackdrop />
      <ModalContent className="h-2/3">
        {isLoading && (
          <Box className="absolute inset-0 z-10 items-center justify-center bg-white/60 rounded-md">
            <Spinner />
          </Box>
        )}
        <ModalHeader className="w-full">
          <Text className="text-center text-lg font-bold">
            {phaseToHeader[phase]}
          </Text>
        </ModalHeader>
        <ModalBody className="h-fit">
          <VStack>
            {getContent()}
            {error && (
              <Box>
                <Text className="text-error-400 text-center mt-2">{error}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        {phase === "score" && (
          <ModalFooter>
            <Button onPress={onCloseModal}>
              <ButtonText>Done</ButtonText>
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
