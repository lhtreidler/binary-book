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
import { useRouter } from "expo-router";

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
  const [compareBook, setCompareBook] = useState<RankingBookInfo | null>(null);
  const [result, setResult] = useState<FinishedRankingResponse | null>(null);

  const phase: Phase = useMemo(() => {
    if (result) return "score";
    if (compareBook) return "comparing";
    return "tier";
  }, [result, compareBook]);

  const startMutation = useStartRanking();
  const continueMutation = useContinueRanking();
  const quitRanking = useQuitRanking();
  const router = useRouter();

  const applyResult = (res: StartRankingResponse | ContinueRankingResponse) => {
    if ("sessionId" in res) {
      setSessionId(res.sessionId);
    }

    if (getIsFinishedRankingResponse(res)) {
      setResult(res);
    } else {
      setCompareBook(res.compareBook);
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
      });
      applyResult(result);
    } catch {
      setError("Could not continue ranking. Please try again.");
    }
  };

  console.log(result, compareBook, sessionId, error);

  const onCloseModal = () => {
    setResult(null);
    setCompareBook(null);
    setSessionId(null);
    setError(null);
    if (result) {
      onClose(result.bookId);
    } else if (sessionId) {
      quitRanking.mutate({ sessionId });
    }
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

    if (phase === "comparing" && compareBook) {
      return (
        <>
          <HStack space="md" className="items-center justify-center">
            {[
              { ...book, isNew: true },
              { ...compareBook, isNew: false },
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
      <ModalContent>
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
        <ModalBody>
          {getContent()}
          {error && (
            <Text className="text-error-400 text-center mt-2">{error}</Text>
          )}
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
