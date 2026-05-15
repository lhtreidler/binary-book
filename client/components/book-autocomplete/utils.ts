import { BookSearchItem } from "@/lib/api/types";
import { AutocompleteOption } from "../autocomplete/types";

export const buildBookOptions = (
  items: BookSearchItem[],
  handlers: {
    onSelect: (apiId: string) => void;
    onBookmark: (apiId: string) => void;
  },
  bookmarkOverrides?: Map<string, string | null>,
  rankedOverrides?: Set<string>,
): AutocompleteOption[] => {
  return items.map(({ apiId, title, authors, isRanked, thumbnail, bookmarkId }) => {
    const authorStr = authors.length ? authors.join(", ") : "Unknown Author";
    const effectiveBookmarkId = bookmarkOverrides?.has(apiId)
      ? bookmarkOverrides.get(apiId)
      : bookmarkId;
    const effectiveIsRanked = isRanked || (rankedOverrides?.has(apiId) ?? false);
    return {
      id: apiId,
      label: `${title} by ${authorStr}`,
      hideAction: effectiveIsRanked,
      thumbnail,
      hasThumbnail: true,
      rightActions: [
        {
          icon: "bookmark" as const,
          isActive: !!effectiveBookmarkId,
          handler: handlers.onBookmark,
        },
        { icon: "add" as const, handler: handlers.onSelect },
      ],
    };
  });
};
