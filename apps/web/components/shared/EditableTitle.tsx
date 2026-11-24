"use client";

import { useState } from "react";
import { resolveRename } from "@/lib/entityName";

/**
 * Page-title input that looks like the heading until focused.
 * Saves on blur or Enter; Esc restores the saved name. Key it on the saved
 * name so an external rename resets the draft.
 */
export function EditableTitle({
  name,
  maxLength,
  label,
  onRename,
}: {
  name: string;
  maxLength: number;
  label: string;
  onRename: (name: string) => void;
}) {
  const [draft, setDraft] = useState(name);

  function commit() {
    const next = resolveRename(draft, name, maxLength);
    if (next) onRename(next);
    else setDraft(name);
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(name);
          // Blur after the reset so commit() sees the unchanged name and skips saving
          const input = e.currentTarget;
          requestAnimationFrame(() => input.blur());
        }
      }}
      maxLength={maxLength}
      aria-label={label}
      className="-mx-1.5 w-full min-w-0 rounded-md bg-transparent px-1.5 py-0.5 outline-none transition-colors duration-(--dur-fast) hover:bg-white/[0.04] focus:bg-white/[0.06] focus:ring-1 focus:ring-ring/50"
    />
  );
}
