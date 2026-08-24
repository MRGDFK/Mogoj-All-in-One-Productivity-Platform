"use client";

import { useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoteCard } from "@/components/notes/NoteCard";
import { NewNoteModal } from "@/components/notes/NewNoteModal";
import { NoteDetailSheet } from "@/components/notes/NoteDetailSheet";

interface ProjectNotesProps {
  projectId: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const { data: notes } = useNotes({ projectId });
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setNewNoteOpen(true)}>
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => setActiveNoteId(note.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={StickyNote} title="No notes yet" description="Capture ideas and context for this project" />
      )}

      <NewNoteModal
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
        projectId={projectId}
        onCreated={(note) => setActiveNoteId(note.id)}
      />

      <NoteDetailSheet noteId={activeNoteId} onOpenChange={(open) => !open && setActiveNoteId(null)} />
    </>
  );
}
