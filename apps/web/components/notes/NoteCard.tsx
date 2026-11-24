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
      className="surface-card spotlight flex flex-col gap-1.5 rounded-xl p-3 text-left transition-[translate,scale,border-color] duration-(--dur-fast) ease-soft hover:-translate-y-0.5 hover:border-white/[0.14] active:scale-[0.985]"
    >
      <p className="truncate text-sm font-medium">{note.title}</p>
      <p className="line-clamp-2 min-h-[2.5em] text-xs text-muted-foreground">
        {preview || "No content yet"}
      </p>
      <p className="text-[10px] text-muted-foreground">Updated {formatDate(note.updatedAt)}</p>
    </button>
  );
}
