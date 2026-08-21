import { BookSearchItem } from "@/lib/api/types";
import { AutocompleteOption } from "../autocomplete/types";
import { Href } from "expo-router";
import { BookOptionContent } from "./BookOptionContent";

const BOOK_ITEM_MAX_HEIGHT = 150;

export const buildBookOptions = (
  items: BookSearchItem[],
  handlers: {
    onSelect: (apiId: string) => void;
    onBookmark: (apiId: string) => void;
  },
  bookmarkOverrides?: Map<string, string | null>,
  rankedOverrides?: Set<string>,
): AutocompleteOption[] => {
  return items.map(
    ({ apiId, id, title, authors, isRanked, thumbnail, bookmarkId }) => {
      const effectiveBookmarkId = bookmarkOverrides?.has(apiId)
        ? bookmarkOverrides.get(apiId)
        : bookmarkId;
      const effectiveIsRanked =
        isRanked || (rankedOverrides?.has(apiId) ?? false);
      return {
        id: apiId,
        label: (
          <BookOptionContent
            title={title}
            authors={authors}
            maxHeight={BOOK_ITEM_MAX_HEIGHT}
          />
        ),
        hideAction: effectiveIsRanked,
        thumbnail,
        hasThumbnail: true,
        href: `/book/${id || apiId}` as Href,
        rightActions: [
          {
            icon: "bookmark" as const,
            isActive: !!effectiveBookmarkId,
            handler: handlers.onBookmark,
          },
          { icon: "add" as const, handler: handlers.onSelect },
        ],
      };
    },
  );
};
