"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import type { Note, TipTapDocument } from "@mogoj/shared";
import { useNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { SheetContent } from "@/components/shared/Sheet";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ResourceEditor } from "@/components/resources/ResourceEditor";

interface NoteDetailSheetProps {
  noteId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function NoteDetailSheet({ noteId, onOpenChange }: NoteDetailSheetProps) {
  const { data: note } = useNote(noteId ?? undefined);

  return (
    <SheetContent open={Boolean(noteId)} onOpenChange={onOpenChange}>
      {!note ? <Loader className="py-16" /> : <NoteDetailForm key={note.id} note={note} onClose={() => onOpenChange(false)} />}
    </SheetContent>
  );
}

function NoteDetailForm({ note, onClose }: { note: Note; onClose: () => void }) {
  const updateNote = useUpdateNote(note.id);
  const deleteNote = useDeleteNote();
  const [title, setTitle] = useState(note.title);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleContentChange(doc: TipTapDocument) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateNote.mutate({ content: doc });
    }, 800);
  }

  async function handleDelete() {
    await deleteNote.mutateAsync(note.id);
    setConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
        <Dialog.Title asChild>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== note.title && updateNote.mutate({ title: title.trim() })}
            className="w-full truncate border-none bg-transparent p-0 text-lg font-medium outline-none"
          />
        </Dialog.Title>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Delete note"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </Dialog.Close>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
        <ResourceEditor content={note.content} onChange={handleContentChange} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this note?"
        description="This permanently deletes the note."
        confirmLabel="Delete"
        destructive
        isLoading={deleteNote.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
