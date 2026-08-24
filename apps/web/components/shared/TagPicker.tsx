"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Tag, TagInput } from "@mogoj/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { Input } from "@/components/shared/Input";
import { TAG_COLORS, tagColorClass, getDefaultColor } from "@/lib/tagColors";
import { cn } from "@/lib/utils";

interface TagPickerProps {
  tags: Tag[];
  allTags: TagInput[];
  onChange: (tags: TagInput[]) => void;
}

function ColorSwatches({ selected, onSelect }: { selected: string; onSelect: (color: string) => void }) {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {TAG_COLORS.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onSelect(c.name)}
          className={cn(
            "h-4 w-4 rounded-full border-2 transition-transform",
            c.swatch,
            selected === c.name ? "border-foreground scale-110" : "border-transparent",
          )}
          aria-label={`${c.name} color`}
        />
      ))}
    </div>
  );
}

export function TagPicker({ tags, allTags, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [manualColor, setManualColor] = useState<string | null>(null);

  const tagNames = useMemo(() => tags.map((t) => t.name), [tags]);
  const asInput = useMemo((): TagInput[] => tags.map((t) => ({ name: t.name, color: t.color })), [tags]);
  const pickedColor = manualColor ?? getDefaultColor(query.trim() || "tag");

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTags.filter(
      (t) => !tagNames.includes(t.name) && (!q || t.name.toLowerCase().includes(q)),
    );
  }, [allTags, tagNames, query]);

  const canCreate =
    query.trim().length > 0 && !allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  function addTag(name: string, color: string) {
    const trimmed = name.trim();
    if (!trimmed || tagNames.includes(trimmed)) return;
    onChange([...asInput, { name: trimmed, color }]);
    setQuery("");
    setManualColor(null);
  }

  function removeTag(name: string) {
    onChange(asInput.filter((t) => t.name !== name));
  }

  function changeColor(name: string, color: string) {
    onChange(asInput.map((t) => (t.name === name ? { ...t, color } : t)));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
            tagColorClass(tag.color),
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="hover:opacity-70">
                {tag.name}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <ColorSwatches selected={tag.color} onSelect={(color) => changeColor(tag.name, color)} />
            </PopoverContent>
          </Popover>
          <button
            type="button"
            onClick={() => removeTag(tag.name)}
            aria-label={`Remove ${tag.name}`}
            className="hover:opacity-70"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setQuery("");
            setManualColor(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            aria-label="Add tag"
          >
            <Plus className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create tag…"
            className="h-7 border-none text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) addTag(query, pickedColor);
            }}
          />
          <ColorSwatches selected={pickedColor} onSelect={setManualColor} />
          <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => addTag(tag.name, tag.color)}
                className="flex w-full items-center rounded-sm px-1.5 py-1 text-left hover:bg-accent"
              >
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", tagColorClass(tag.color))}>
                  {tag.name}
                </span>
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => addTag(query, pickedColor)}
                className="flex w-full items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-xs text-muted-foreground hover:bg-accent"
              >
                <span className={cn("h-3 w-3 rounded-full", TAG_COLORS.find((c) => c.name === pickedColor)?.swatch)} />
                <Plus className="h-3 w-3" />
                Create &ldquo;{query.trim()}&rdquo;
              </button>
            )}
            {suggestions.length === 0 && !canCreate && (
              <p className="px-1.5 py-1 text-xs text-muted-foreground">No tags yet — type to create one</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
