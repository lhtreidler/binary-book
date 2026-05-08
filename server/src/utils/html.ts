const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
};

export const decodeHtmlEntities = (s: string) =>
  s
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    );

export const stripHtml = (html: string) =>
  decodeHtmlEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();