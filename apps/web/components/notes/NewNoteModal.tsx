"use client";

import { useState } from "react";
import type { Note } from "@mogoj/shared";
import { useCreateNote } from "@/hooks/useNotes";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";

interface NewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  resourceId?: string;
  onCreated: (note: Note) => void;
}

export function NewNoteModal({ open, onOpenChange, projectId, resourceId, onCreated }: NewNoteModalProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createNote = useCreateNote();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const note = await createNote.mutateAsync({
        title,
        ...(projectId ? { projectId } : {}),
        ...(resourceId ? { resourceId } : {}),
        content: { type: "doc", content: [{ type: "paragraph" }] },
      });
      setTitle("");
      onOpenChange(false);
      onCreated(note);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New note">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createNote.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
