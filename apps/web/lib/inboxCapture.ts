import type { CreateInboxItemInput, InboxType, TipTapDocument } from "@mogoj/shared";

const TITLE_MAX = 300; // createInboxItemSchema limit

const paragraphs = (lines: string[]): TipTapDocument => ({
  type: "doc",
  content: lines.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
});

/**
 * Quick capture text → Inbox item: the first non-empty line is the title, the remaining
 * non-empty lines become body paragraphs. A first line over the title limit is kept whole in the body.
 */
export function buildInboxCapture(text: string, type: InboxType): CreateInboxItemInput | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const [first, ...rest] = lines;
  if (!first) return null;

  const bodyLines = first.length > TITLE_MAX ? [first, ...rest] : rest;
  return {
    title: first.slice(0, TITLE_MAX),
    type,
    attachments: [],
    ...(bodyLines.length > 0 && { body: paragraphs(bodyLines) }),
  };
}
