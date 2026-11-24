"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, Loader2, Upload as UploadIcon, Check, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { usePresignUpload } from "@/hooks/useResources";
import type { PresignUploadInput } from "@mogoj/shared";
import { getApiErrorMessage } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { Input } from "@/components/shared/Input";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { ICON_LIBRARY, ICON_NAMES, EMOJI_LIBRARY, ICON_COLORS } from "@/lib/iconRegistry";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  icon: string;
  color: string;
  onChange: (next: { icon?: string; color?: string }) => void;
  triggerSize?: number;
  className?: string;
  /** Icon to render when no icon is set. Defaults to Folder; pass FolderKanban for projects. */
  fallback?: LucideIcon;
}

type Tab = "emoji" | "icons" | "upload";

const UPLOAD_ACCEPT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function IconPicker({ icon, color, onChange, triggerSize = 40, className, fallback }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("icons");
  const [query, setQuery] = useState("");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presignUpload = usePresignUpload();

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_NAMES;
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  const filteredEmoji = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_LIBRARY;
    return EMOJI_LIBRARY.filter((e) => e.keywords.includes(q));
  }, [query]);

  function shuffle() {
    if (tab === "emoji") {
      const pick = EMOJI_LIBRARY[Math.floor(Math.random() * EMOJI_LIBRARY.length)]!;
      onChange({ icon: pick.emoji });
    } else {
      const pick = ICON_NAMES[Math.floor(Math.random() * ICON_NAMES.length)]!;
      onChange({ icon: pick });
    }
  }

  async function handleFileSelected(file: File) {
    const contentType = file.type as PresignUploadInput["contentType"];
    if (!(contentType in UPLOAD_ACCEPT)) {
      toast.error("Please upload a PNG, JPEG, WEBP, or GIF image");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image must be under 25MB");
      return;
    }

    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await presignUpload.mutateAsync({
        filename: file.name,
        contentType,
        sizeBytes: file.size,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      onChange({ icon: publicUrl });
      setOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-xl border border-border bg-card transition-colors hover:border-border",
            className,
          )}
          style={{ width: triggerSize, height: triggerSize }}
        >
          <EntityIcon icon={icon} color={color} size={Math.round(triggerSize * 0.5)} fallback={fallback} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab("emoji")}
              className={cn(
                "border-b-2 pb-1 pt-0.5 transition-colors",
                tab === "emoji" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Emoji
            </button>
            <button
              type="button"
              onClick={() => setTab("icons")}
              className={cn(
                "border-b-2 pb-1 pt-0.5 transition-colors",
                tab === "icons" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Icons
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={cn(
                "border-b-2 pb-1 pt-0.5 transition-colors",
                tab === "upload" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Upload
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ icon: "", color: "#000000" });
              setOpen(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Remove
          </button>
        </div>

        {tab !== "upload" && (
          <div className="flex items-center gap-1.5 px-3 pt-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter"
              className="h-8 text-xs"
            />
            <button
              type="button"
              onClick={shuffle}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Random icon"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setColorMenuOpen((v) => !v)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border"
                style={{ backgroundColor: color }}
                aria-label="Icon color"
              />
              {colorMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setColorMenuOpen(false)} />
                  <div className="glass-overlay absolute right-0 top-[calc(100%+6px)] z-20 w-max rounded-xl p-3 duration-150 ease-soft animate-in fade-in-0 zoom-in-[0.98] slide-in-from-top-1">
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            onChange({ color: c });
                            setColorMenuOpen(false);
                          }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/40"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        >
                          {c === color && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                    <CustomColorSwatch
                      color={color}
                      isCustom={!ICON_COLORS.includes(color)}
                      onPick={(c) => {
                        onChange({ color: c });
                        setColorMenuOpen(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "emoji" && (
          <div className="grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-3">
            {filteredEmoji.map((e) => (
              <button
                key={e.emoji}
                type="button"
                onClick={() => {
                  onChange({ icon: e.emoji });
                  setOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent"
              >
                {e.emoji}
              </button>
            ))}
            {filteredEmoji.length === 0 && (
              <p className="col-span-8 py-4 text-center text-xs text-muted-foreground">No matches</p>
            )}
          </div>
        )}

        {tab === "icons" && (
          <div className="grid max-h-64 grid-cols-8 gap-0.5 overflow-y-auto p-3">
            {filteredIcons.map((name) => {
              const Icon = ICON_LIBRARY[name]!;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange({ icon: name });
                    setOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  style={tab === "icons" && name === icon ? { color } : undefined}
                  aria-label={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <p className="col-span-8 py-4 text-center text-xs text-muted-foreground">No matches</p>
            )}
          </div>
        )}

        {tab === "upload" && (
          <div className="p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={Object.keys(UPLOAD_ACCEPT).join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelected(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-8 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadIcon className="h-5 w-5" />
              )}
              {uploading ? "Uploading…" : "Click to upload an image"}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Native color input; saves on the picker's final `change` event, not on every drag tick. */
function CustomColorSwatch({ color, isCustom, onPick }: { color: string; isCustom: boolean; onPick: (c: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const handle = () => onPickRef.current(input.value);
    input.addEventListener("change", handle);
    return () => input.removeEventListener("change", handle);
  }, []);

  return (
    <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border-t border-border pt-3 text-xs text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground">
      <span
        className="relative flex h-6 w-6 items-center justify-center rounded-full border border-border"
        style={{ background: isCustom ? color : "conic-gradient(#f87171, #facc15, #4ade80, #22d3ee, #7c9cff, #e879f9, #f87171)" }}
      >
        {isCustom && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
      </span>
      Custom
      {isCustom && <span className="ml-auto font-mono uppercase">{color}</span>}
      <input ref={ref} type="color" defaultValue={color} className="sr-only" />
    </label>
  );
}
