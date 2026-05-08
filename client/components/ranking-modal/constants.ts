export const TierButtons = [
  { value: 2, label: "Loved it", className: "bg-green-600" },
  { value: 1, label: "Liked it", className: "bg-amber-400" },
  { value: 0, label: "It was ok", className: "bg-red-400" },
];

export type Phase = "tier" | "comparing" | "score";

export const phaseToHeader = {
  tier: "How did you feel about it?",
  comparing: "Which is better?",
  score: "Your score",
};
