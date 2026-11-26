"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { m } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Inbox, Keyboard, Mic, MoreHorizontal, Settings, X } from "lucide-react";
import { toast } from "sonner";
import type { HQDashboard, InboxType } from "@mogoj/shared";
import { useCreateInboxItem, useUnprocessedInboxCount } from "@/hooks/useInbox";
import { useQuickCaptureShortcut } from "@/hooks/useQuickCaptureShortcut";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { buildInboxCapture } from "@/lib/inboxCapture";
import { isMacPlatform, matchesShortcut } from "@/lib/shortcut";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shared/DropdownMenu";
import { CREATE_ACTIONS, runCreateAction } from "@/components/layout/createActions";

const TYPES: { value: InboxType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "idea", label: "Idea" },
  { value: "note", label: "Note" },
  { value: "project", label: "Project" },
];

const ROUND_BTN =
  "spotlight flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-white/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const CHIP =
  "spotlight flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** App-wide Quick Capture (Inbox only), opened by the user's shortcut (default Mod+Shift+K) or any + menu. */
export function QuickCaptureDialog() {
  const open = useUIStore((s) => s.quickCaptureOpen);
  const setOpen = useUIStore((s) => s.setQuickCaptureOpen);
  const { shortcut } = useQuickCaptureShortcut();

  useEffect(() => {
    const isMac = isMacPlatform();
    function onKeyDown(e: KeyboardEvent) {
      if (!matchesShortcut(e, shortcut, isMac)) return;
      e.preventDefault();
      const { quickCaptureOpen, setQuickCaptureOpen } = useUIStore.getState();
      setQuickCaptureOpen(!quickCaptureOpen);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[6px] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {/* Phones: full-screen sheet. sm and up: the same content as a centered dialog. */}
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-overlay fixed inset-0 z-50 flex flex-col overflow-y-auto rounded-none border-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] duration-200 ease-soft focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-32px)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-white/12 sm:p-6 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-[0.97]"
          style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.1), 0 24px 64px rgb(0 0 0 / 0.5), 0 0 120px -8px rgb(124 156 255 / 0.45)" }}
        >
          <CaptureScreen onClose={() => setOpen(false)} />
          {/* Soft specular glint along the bottom edge (dialog layout only) */}
          <span aria-hidden className="pointer-events-none absolute inset-x-1/4 bottom-0 hidden h-px bg-gradient-to-r from-transparent via-white/40 to-transparent sm:block" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Minimal Web Speech API surface (Chrome/Edge/Safari; absent in Firefox, where Speak is hidden)
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
function speechRecognition(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Mounted only while open, so every open starts empty
function CaptureScreen({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createInbox = useCreateInboxItem();
  const { data: inboxCount } = useUnprocessedInboxCount();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const [Speech] = useState(speechRecognition);
  const [text, setText] = useState("");
  const [type, setType] = useState<InboxType>("task");
  const [listening, setListening] = useState(false);
  const mod = isMacPlatform() ? "⌘" : "Ctrl";

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function toggleSpeak() {
    if (!Speech) return;
    if (listening) return recognitionRef.current?.stop();
    const rec = new Speech();
    rec.lang = navigator.language;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const heard = Array.from(e.results, (r) => r[0]?.transcript ?? "").join(" ").trim();
      if (heard) setText((t) => (t.trim() ? `${t.trimEnd()} ${heard}` : heard));
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      if (e.error !== "aborted" && e.error !== "no-speech")
        toast.error(e.error === "not-allowed" ? "Microphone access is blocked" : "Couldn't hear that");
    };
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function submit(keepOpen: boolean) {
    const item = buildInboxCapture(text, type);
    if (!item || createInbox.isPending) return;

    queryClient.setQueryData<number>(["inbox", "unprocessed-count"], (n) => (n ?? 0) + 1);
    queryClient.setQueriesData<HQDashboard>({ queryKey: ["dashboard"] }, (old) =>
      old && { ...old, inboxUnprocessedCount: old.inboxUnprocessedCount + 1 },
    );
    createInbox.mutate(item, {
      onSuccess: () => toast.success("Saved to Inbox"),
      onError: (err) => {
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["inbox"] });
        toast.error(getApiErrorMessage(err) || "Couldn't save to Inbox");
      },
    });

    if (!keepOpen) return onClose();
    setText("");
    textRef.current?.focus();
  }

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Dialog.Close aria-label="Close" className={ROUND_BTN}>
          <X className="h-4.5 w-4.5" />
        </Dialog.Close>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More options" className={ROUND_BTN}>
            <MoreHorizontal className="h-4.5 w-4.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => go("/inbox")} className="gap-2.5">
              <Inbox className="h-4 w-4" /> Open Inbox
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => go("/settings")} className="gap-2.5">
              <Settings className="h-4 w-4" /> Change shortcut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 space-y-1">
        <Dialog.Title className="text-2xl font-medium">Quick Capture</Dialog.Title>
        <p className="text-sm text-muted-foreground">Capture anything. It lands in your Inbox to sort out later.</p>
      </div>

      <form
        className="spotlight mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.09),0_10px_30px_rgb(0_0_0/0.25)]"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <label htmlFor="quick-capture-text" className="text-sm font-medium">
          What would you like to capture?
        </label>
        <textarea
          id="quick-capture-text"
          ref={textRef}
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit(e.shiftKey);
            }
          }}
          placeholder="A thought, task or link. The first line becomes the title."
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[15px] leading-relaxed text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)] outline-none placeholder:text-muted-foreground focus-visible:border-ring/60"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => textRef.current?.focus()}
            className={cn(CHIP, !listening ? "border-white/15 bg-white/[0.07] text-foreground" : "border-white/10 text-muted-foreground")}
          >
            <Keyboard className="h-4 w-4" strokeWidth={1.75} /> Type
          </button>
          {Speech && (
            <button
              type="button"
              aria-pressed={listening}
              onClick={toggleSpeak}
              className={cn(CHIP, listening ? "border-primary/50 bg-primary/15 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}
            >
              <Mic className="h-4 w-4" strokeWidth={1.75} /> {listening ? "Listening… tap to stop" : "Speak"}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Save as" className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {TYPES.map((t) => {
              const active = t.value === type;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-(--dur-fast)",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <m.span
                      layoutId="quick-capture-type"
                      className="absolute inset-0 rounded-full bg-white/[0.1]"
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
          <Button type="submit" disabled={!text.trim() || createInbox.isPending} className="max-sm:w-full">
            Save to Inbox
          </Button>
        </div>
        <p className="mt-2 text-right text-[11px] text-muted-foreground pointer-coarse:hidden">
          {mod}↵ save · ⇧{mod}↵ save and add another
        </p>
      </form>

      <h3 className="mt-6 text-sm font-medium text-muted-foreground">Or create directly</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {CREATE_ACTIONS.filter((a) => a.key !== "capture").map(({ key, label, hint, icon: Icon }) => (
          <ActionCard
            key={key}
            icon={Icon}
            label={label}
            hint={hint}
            onClick={() => {
              onClose();
              runCreateAction(key);
            }}
          />
        ))}
        <ActionCard
          icon={Inbox}
          label="Open Inbox"
          hint={inboxCount ? `${inboxCount} waiting to be processed` : "Nothing waiting"}
          onClick={() => go("/inbox")}
        />
      </div>
    </>
  );
}

function ActionCard({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-card spotlight group relative flex min-h-28 flex-col sm:min-h-24 rounded-2xl p-4 text-left transition-[border-color] duration-(--dur-fast) hover:border-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
      <span className="mt-auto pt-4 text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <span
        aria-hidden
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground transition-colors duration-(--dur-fast) group-hover:bg-white/[0.12] group-hover:text-foreground"
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
