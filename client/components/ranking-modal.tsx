import { useEffect, useState } from "react";

import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./ui/modal";
import { Pressable } from "./ui/pressable";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

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

const TIERS = [
  { value: 2, label: "Loved it" },
  { value: 1, label: "Liked it" },
  { value: 0, label: "It was ok" },
];

type Phase = "tier" | "comparing" | "score";

const formatAuthors = (authors: string[]) =>
  authors.length ? authors.join(", ") : "Unknown Author";

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
  onClose: () => void;
}) => {
  const [phase, setPhase] = useState<Phase>("tier");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [compareBook, setCompareBook] = useState<RankingBookInfo | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startMutation = useStartRanking();
  const continueMutation = useContinueRanking();
  const quitRanking = useQuitRanking();

  useEffect(() => {
    if (isOpen) {
      setPhase("tier");
      setSessionId(null);
      setCompareBook(null);
      setScore(null);
      setError(null);
    }
  }, [isOpen, book?.key]);

  const applyResult = (
    result: StartRankingResponse | ContinueRankingResponse,
  ) => {
    console.log(result);
    if (getIsFinishedRankingResponse(result)) {
      setScore(result.score);
      setPhase("score");
    } else {
      setCompareBook(result.compareBook);
      setPhase("comparing");
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

      if (!getIsFinishedRankingResponse(result)) {
        setSessionId(result.sessionId);
      }

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

  const onCloseModal = () => {
    onClose();
    if (sessionId && score === null) {
      quitRanking.mutate({ sessionId });
    }
  };

  const isLoading = startMutation.isPending || continueMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalBackdrop />
      <ModalContent>
        {phase === "tier" && book && (
          <>
            <ModalHeader>
              <Text className="text-lg font-bold">
                How did you feel about it?
              </Text>
            </ModalHeader>
            <ModalBody>
              <Text className="mb-4">
                {book.title} by {formatAuthors(book.authors)}
              </Text>
              <VStack space="sm">
                {TIERS.map((tier) => (
                  <Button
                    key={tier.value}
                    onPress={() => handleTierPick(tier.value)}
                    isDisabled={isLoading}
                  >
                    <ButtonText>{tier.label}</ButtonText>
                  </Button>
                ))}
              </VStack>
              {isLoading && <Spinner className="mt-4" />}
            </ModalBody>
          </>
        )}

        {phase === "comparing" && book && compareBook && (
          <>
            <ModalHeader>
              <Text className="text-lg font-bold">Which is better?</Text>
            </ModalHeader>
            <ModalBody>
              <HStack space="md" className="items-center justify-center">
                <Pressable
                  onPress={() => handleChoice(true)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Box className="aspect-square p-3 border border-gray-300 rounded-md justify-center items-center bg-slate-50">
                    <Text className="font-bold text-center">{book.title}</Text>
                    <Text className="mt-2 text-sm text-center">
                      {formatAuthors(book.authors)}
                    </Text>
                  </Box>
                </Pressable>
                <Text className="font-bold">OR</Text>
                <Pressable
                  onPress={() => handleChoice(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Box className="aspect-square p-3 border border-gray-300 rounded-md justify-center items-center bg-slate-50">
                    <Text className="font-bold text-center">
                      {compareBook.title ?? "Untitled"}
                    </Text>
                    <Text className="mt-2 text-sm text-center">
                      {formatAuthors(compareBook.authors)}
                    </Text>
                  </Box>
                </Pressable>
              </HStack>
              {isLoading && <Spinner className="mt-4" />}
            </ModalBody>
          </>
        )}

        {phase === "score" && score !== null && (
          <>
            <ModalHeader>
              <Text className="text-lg font-bold">Your score</Text>
            </ModalHeader>
            <ModalBody>
              <Text className="text-5xl text-center font-bold">
                {score.toFixed(1)}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>
                <ButtonText>Done</ButtonText>
              </Button>
            </ModalFooter>
          </>
        )}

        {error && (
          <Text className="text-error-400 text-center mt-2">{error}</Text>
        )}
      </ModalContent>
    </Modal>
  );
};
