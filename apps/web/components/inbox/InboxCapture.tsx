"use client";

import { useState } from "react";
import type { InboxType } from "@mogoj/shared";
import { useCreateInboxItem } from "@/hooks/useInbox";
import { textToDoc } from "@/lib/tiptap";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";

const TYPE_OPTIONS: { value: InboxType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "project", label: "Project" },
  { value: "note", label: "Note" },
  { value: "idea", label: "Idea" },
];

export function InboxCapture() {
  const createItem = useCreateInboxItem();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<InboxType>("task");
  const [body, setBody] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await createItem.mutateAsync({
      title: title.trim(),
      type,
      body: body.trim() ? textToDoc(body.trim()) : undefined,
      attachments: [],
    });

    setTitle("");
    setBody("");
    setType("task");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start"
    >
      <div className="flex-1 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture a task, idea, or note…"
          autoFocus
        />
        {title && (
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a detail (optional)"
          />
        )}
      </div>

      <div className="flex gap-2">
        <Select value={type} onValueChange={(v) => setType(v as InboxType)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={!title.trim() || createItem.isPending}>
          Capture
        </Button>
      </div>
    </form>
  );
}
