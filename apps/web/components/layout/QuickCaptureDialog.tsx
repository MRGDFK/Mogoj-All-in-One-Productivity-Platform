"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { m } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Flag, Inbox, Sun } from "lucide-react";
import { toast } from "sonner";
import type { HQDashboard, Priority, Task } from "@mogoj/shared";
import { useAreas } from "@/hooks/useAreas";
import { useCreateInboxItem } from "@/hooks/useInbox";
import { useCreateTask } from "@/hooks/useTasks";
import { useQuickCaptureShortcut } from "@/hooks/useQuickCaptureShortcut";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { getDeadlineDisplay } from "@/lib/deadline";
import { formatShortcut, isMacPlatform, matchesShortcut } from "@/lib/shortcut";
import { cn, formatDate } from "@/lib/utils";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { PRIORITY_LABELS, PriorityIcon } from "@/components/shared/PriorityIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";

type Destination = "inbox" | "today";

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const PILL =
  "relative flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground";
const MENU_ITEM = "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent";

const localDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return formatDate(d, "yyyy-MM-dd");
};
// Noon UTC of the chosen calendar day: lib/deadline.ts reads due dates by their UTC day
const toDueDate = (day: string) => new Date(`${day}T12:00:00Z`);

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

const Divider = () => <span aria-hidden className="mb-1 hidden h-6 w-px self-end bg-white/10 sm:block" />;

/** App-wide quick capture popup, opened from anywhere with the user's shortcut (default Mod+Shift+K). */
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
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-overlay fixed left-1/2 top-[28%] z-50 w-[calc(100%-32px)] max-w-2xl -translate-x-1/2 rounded-2xl border-white/12 p-6 duration-200 ease-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[0.97] data-[state=closed]:zoom-out-[0.97]"
          style={{
            boxShadow:
              "inset 0 1px 0 rgb(255 255 255 / 0.1), 0 24px 64px rgb(0 0 0 / 0.5), 0 0 120px -8px rgb(124 156 255 / 0.45)",
          }}
        >
          <Dialog.Title className="sr-only">Quick capture</Dialog.Title>
          {/* Soft specular glint along the bottom edge */}
          <span aria-hidden className="pointer-events-none absolute inset-x-1/4 -bottom-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <CaptureForm onDone={() => setOpen(false)} shortcutKeys={formatShortcut(shortcut, isMacPlatform())} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Mounted only while open, so every open starts from a clean Inbox state
function CaptureForm({ onDone, shortcutKeys }: { onDone: () => void; shortcutKeys: string[] }) {
  const queryClient = useQueryClient();
  const { data: areas } = useAreas({ status: "active" });
  const createInbox = useCreateInboxItem();
  const createTask = useCreateTask();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState<Destination>("inbox");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [due, setDue] = useState<string | null>(null);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);

  const effectiveDue = due ?? (destination === "today" ? localDay() : null);
  const isTask = destination === "today" || priority !== null || due !== null;
  // The API requires every task to live in an area or project
  const needsArea = isTask && !areaId;
  const pending = createInbox.isPending || createTask.isPending;
  const canSubmit = title.trim().length > 0 && !needsArea && !pending;

  function reset() {
    setDestination("inbox");
    setAreaId(null);
    setPriority(null);
    setDue(null);
  }

  function chooseDestination(next: Destination) {
    setDestination(next);
    if (next === "today" && !areaId && areas?.[0]) setAreaId(areas[0].id);
  }

  function rollback(err: unknown) {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["inbox"] });
    toast.error(getApiErrorMessage(err) || "Couldn't capture");
  }

  function submit(keepOpen: boolean) {
    const value = title.trim();
    if (!canSubmit) return;

    if (!isTask) {
      queryClient.setQueryData<number>(["inbox", "unprocessed-count"], (n) => (n ?? 0) + 1);
      queryClient.setQueriesData<HQDashboard>({ queryKey: ["dashboard"] }, (old) =>
        old && { ...old, inboxUnprocessedCount: old.inboxUnprocessedCount + 1 },
      );
      createInbox.mutate(
        { title: value, type: "task", attachments: [] },
        { onSuccess: () => toast.success("Captured to Inbox"), onError: rollback },
      );
    } else {
      const dueDate = effectiveDue ? toDueDate(effectiveDue) : undefined;
      // Due today or earlier lands in HQ's Today list: show it now, the refetch swaps in the real row
      if (dueDate && effectiveDue && effectiveDue <= localDay()) {
        const temp = {
          id: `temp-${Date.now()}`,
          title: value,
          status: "todo",
          priority: priority ?? "medium",
          dueDate: dueDate.toISOString(),
          areaId,
          projectId: null,
        } as unknown as Task;
        queryClient.setQueriesData<HQDashboard>({ queryKey: ["dashboard"] }, (old) =>
          old && { ...old, todayTasks: [...old.todayTasks, temp] },
        );
      }
      createTask.mutate(
        {
          title: value,
          areaId: areaId ?? undefined,
          status: "todo",
          priority: priority ?? "medium",
          dueDate,
          tags: [],
          isRecurring: false,
        },
        {
          onSuccess: () => toast.success(effectiveDue === localDay() ? "Task added to Today" : "Task created"),
          onError: rollback,
        },
      );
    }

    if (!keepOpen) return onDone();
    setTitle("");
    reset();
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
    >
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)]">
        {destination === "today" ? (
          <Sun className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        ) : (
          <Inbox className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              submit(true);
            }
          }}
          maxLength={300}
          aria-label="Quick capture"
          placeholder={destination === "today" ? "Add a task due today..." : "Capture a thought, task, or link to Inbox..."}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-3">
        <Group label="Destination">
          {(["inbox", "today"] as const).map((d) => {
            const active = destination === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => chooseDestination(d)}
                aria-pressed={active}
                className={cn(PILL, active && "border-white/25 text-foreground")}
              >
                {active && (
                  <m.span
                    layoutId="quick-capture-destination"
                    className="absolute inset-0 rounded-full bg-white/[0.08]"
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  />
                )}
                {active && <span className="relative h-1.5 w-1.5 rounded-full bg-brand" />}
                <span className="relative">{d === "inbox" ? "Inbox" : "Today"}</span>
              </button>
            );
          })}
        </Group>

        {areas && areas.length > 0 && (
          <>
            <Divider />
            <Group label="Area">
              {areas.map((area) => {
                const active = areaId === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setAreaId(active ? null : area.id)}
                    aria-pressed={active}
                    className={cn(PILL, active && "text-foreground", needsArea && "border-dashed")}
                    style={active ? { borderColor: `${area.color}80`, backgroundColor: `${area.color}1f` } : undefined}
                  >
                    <EntityIcon icon={area.icon} color={area.color} size={13} />
                    {area.name}
                  </button>
                );
              })}
            </Group>
          </>
        )}

        <Divider />
        <Group label="Priority">
          <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(PILL, "px-2.5", priority && "text-foreground")}
                aria-label={priority ? `Priority: ${PRIORITY_LABELS[priority]}` : "Set priority"}
                title={priority ? PRIORITY_LABELS[priority] : "Priority"}
              >
                {priority ? <PriorityIcon priority={priority} size={13} /> : <Flag className="h-3.5 w-3.5" />}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={MENU_ITEM}
                  onClick={() => {
                    setPriority(p);
                    setPriorityOpen(false);
                  }}
                >
                  <PriorityIcon priority={p} size={12} />
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
              {priority && (
                <button
                  type="button"
                  className={cn(MENU_ITEM, "text-muted-foreground")}
                  onClick={() => {
                    setPriority(null);
                    setPriorityOpen(false);
                  }}
                >
                  Clear
                </button>
              )}
            </PopoverContent>
          </Popover>
        </Group>

        <Divider />
        <Group label="Due Date">
          <Popover open={dueOpen} onOpenChange={setDueOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(PILL, effectiveDue && "text-foreground")} aria-label="Due date">
                <CalendarDays className="h-3.5 w-3.5" />
                {effectiveDue ? getDeadlineDisplay(toDueDate(effectiveDue).toISOString())?.label : "No date"}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 space-y-1 p-1">
              {[
                { label: "Today", day: localDay() },
                { label: "Tomorrow", day: localDay(1) },
                { label: "Next week", day: localDay(7) },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className={MENU_ITEM}
                  onClick={() => {
                    setDue(o.day);
                    setDueOpen(false);
                  }}
                >
                  {o.label}
                </button>
              ))}
              <input
                type="date"
                aria-label="Pick a date"
                value={due ?? ""}
                onChange={(e) => setDue(e.target.value || null)}
                className="w-full rounded-md border border-white/10 bg-black/25 px-2 py-1 text-xs text-foreground [color-scheme:dark]"
              />
              {due && (
                <button
                  type="button"
                  className={cn(MENU_ITEM, "text-muted-foreground")}
                  onClick={() => {
                    setDue(null);
                    setDueOpen(false);
                  }}
                >
                  Clear date
                </button>
              )}
            </PopoverContent>
          </Popover>
        </Group>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="hidden text-xs text-muted-foreground sm:block">
          <Keys keys={["⇧", "↵"]} /> capture another · <Keys keys={shortcutKeys} /> open anywhere · <Keys keys={["Esc"]} /> close
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          title={needsArea ? "Pick an area for this task" : undefined}
          className="ml-auto flex h-10 items-center gap-2.5 rounded-xl bg-brand px-4 text-sm font-medium text-slate-950 shadow-[0_0_20px_rgb(124_156_255/0.45)] transition-[background-color,box-shadow,scale,opacity] duration-(--dur-fast) hover:bg-brand/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 disabled:shadow-[0_0_12px_rgb(124_156_255/0.2)]"
        >
          {needsArea ? "Pick an area" : "Capture"}
          <kbd className="flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-950/15 px-1 font-mono text-[11px]">↵</kbd>
        </button>
      </div>
    </form>
  );
}

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {keys.map((k) => (
        <kbd key={k} className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono text-[10px] text-foreground/80">
          {k}
        </kbd>
      ))}
    </span>
  );
}
