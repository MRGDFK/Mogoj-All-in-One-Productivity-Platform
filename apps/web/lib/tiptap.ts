import type { TipTapDocument } from "@mogoj/shared";

export function textToDoc(text: string): TipTapDocument {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

// Flattens a TipTap doc to plain text for previews/list rows.
export function docToText(doc: TipTapDocument | null | undefined): string {
  if (!doc) return "";

  function walk(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text" && n.text) return n.text;
    if (Array.isArray(n.content)) return n.content.map(walk).join(" ");
    return "";
  }

  return walk(doc).trim();
}
