"use client";

import { useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import type { TaskStatus } from "@mogoj/shared";
import { cn } from "@/lib/utils";

interface QuickAddInputProps {
  status: TaskStatus;
  onAdd: (title: string, status: TaskStatus) => void;
  disabled?: boolean;
}

export function QuickAddInput({ status, onAdd, disabled }: QuickAddInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed, status);
      setTitle("");
    }
    setIsEditing(false);
  }, [title, status, onAdd]);

  const handleCancel = useCallback(() => {
    setTitle("");
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSubmit, handleCancel],
  );

  if (isEditing) {
    return (
      <div className="mt-1">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          placeholder="Task title..."
          autoFocus
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm",
            "placeholder:text-muted-foreground focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100",
          )}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      disabled={disabled}
      className={cn(
        "mt-1 flex w-full items-center gap-1.5 rounded-md border border-transparent py-1.5 px-2 text-xs text-muted-foreground",
        "transition-colors hover:border-dashed hover:border-border hover:bg-background/80 hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Plus className="h-3.5 w-3.5" />
      Add task
    </button>
  );
}
