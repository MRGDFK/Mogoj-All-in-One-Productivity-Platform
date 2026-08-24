import type { Note } from "@mogoj/shared";
import { docToText } from "@/lib/tiptap";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const preview = docToText(note.content);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-border/80 hover:bg-accent/40"
    >
      <p className="truncate text-sm font-medium">{note.title}</p>
      <p className="line-clamp-2 min-h-[2.5em] text-xs text-muted-foreground">
        {preview || "No content yet"}
      </p>
      <p className="text-[10px] text-muted-foreground">Updated {formatDate(note.updatedAt)}</p>
    </button>
  );
}
