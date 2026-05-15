import { BookSearchItem } from "@/lib/api/types";
import { AutocompleteOption } from "../autocomplete/types";

export const buildBookOptions = (
  items: BookSearchItem[],
  handlers: {
    onSelect: (apiId: string) => void;
    onBookmark: (apiId: string) => void;
  },
): AutocompleteOption[] => {
  return items.map(({ apiId, title, authors, isRanked, thumbnail, bookmarkId }) => {
    const authorStr = authors.length ? authors.join(", ") : "Unknown Author";
    return {
      id: apiId,
      label: `${title} by ${authorStr}`,
      hideAction: isRanked,
      thumbnail,
      hasThumbnail: true,
      rightActions: [
        {
          icon: "bookmark" as const,
          isActive: !!bookmarkId,
          handler: handlers.onBookmark,
        },
        { icon: "add" as const, handler: handlers.onSelect },
      ],
    };
  });
};
