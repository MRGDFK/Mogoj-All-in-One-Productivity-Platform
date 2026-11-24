"use client";

import { useState } from "react";
import { CheckCircle2, Compass, FolderKanban, LayoutGrid, List, ListTodo, Plus, Flame } from "lucide-react";
import { createAreaSchema } from "@mogoj/shared";
import { useAreas, useCreateArea } from "@/hooks/useAreas";
import { summarizeAreas } from "@/lib/areaMetrics";
import { MetricCard } from "@/components/projects/PortfolioMetricStrip";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { AnimatedViewSwitch } from "@/components/shared/AnimatedViewSwitch";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { AreaList } from "@/components/areas/AreaList";
import { getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
import { AreaGrid } from "@/components/areas/AreaGrid";
import { IconPicker } from "@/components/shared/IconPicker";
import { ICON_COLORS } from "@/lib/iconRegistry";

type ViewMode = "card" | "list";
const VIEW_OPTIONS = [
  { value: "card" as const, label: "Card", icon: LayoutGrid },
  { value: "list" as const, label: "List", icon: List },
];

export default function AreasPage() {
  const { data: areas, isLoading } = useAreas({ status: "active" });
  const [view, setView] = useState<ViewMode>("card");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState<string>(ICON_COLORS[0]!);
  const [error, setError] = useState<string | null>(null);
  const createArea = useCreateArea();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createAreaSchema.safeParse({
      name,
      description: description || undefined,
      icon,
      color,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createArea.mutateAsync(parsed.data);
      setName("");
      setDescription("");
      setIcon("Folder");
      setColor(ICON_COLORS[0]!);
      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Areas"
        description="Ongoing domains of your life and work."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New Area
          </Button>
        }
      />

      {isLoading ? (
        <Loader label="Loading areas…" />
      ) : !areas || areas.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No areas yet"
          description="Areas are the ongoing domains of your life — Personal, Work, Health. Create your first one."
        />
      ) : (
        <>
          <AreaMetrics areas={areas} />
          <div className="mb-4">
            <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
          </div>
          <AnimatedViewSwitch index={VIEW_OPTIONS.findIndex((o) => o.value === view)}>
            {[<AreaGrid key="card" areas={areas} />, <AreaList key="list" areas={areas} />]}
          </AnimatedViewSwitch>
        </>
      )}

      <Modal open={open} onOpenChange={setOpen} title="New area">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Name</Label>
            <div className="flex items-center gap-2">
              <IconPicker
                icon={icon}
                color={color}
                onChange={(next) => {
                  if (next.icon !== undefined) setIcon(next.icon);
                  if (next.color !== undefined) setColor(next.color);
                }}
              />
              <Input
                id="area-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-description">Description (optional)</Label>
            <Textarea
              id="area-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createArea.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AreaMetrics({ areas }: { areas: Parameters<typeof summarizeAreas>[0] }) {
  const m = summarizeAreas(areas);
  const total = m.openTasks + m.doneTasks;
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Compass className="h-4 w-4 text-indigo-400" />}
        label="Areas"
        value={m.areas}
        sublabel="ongoing responsibilities"
        accent="bg-indigo-500/10"
      />
      <MetricCard
        icon={<FolderKanban className="h-4 w-4 text-blue-400" />}
        label="Projects"
        value={m.projects}
        sublabel="not archived"
        accent="bg-blue-500/10"
      />
      <MetricCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        label="Task completion"
        value={total > 0 ? `${m.doneTasks}/${total}` : "—"}
        progress={total > 0 ? Math.round((m.doneTasks / total) * 100) : undefined}
        accent="bg-emerald-500/10"
      />
      <MetricCard
        icon={m.busiest ? <Flame className="h-4 w-4 text-amber-400" /> : <ListTodo className="h-4 w-4 text-amber-400" />}
        label="Busiest area"
        value={m.busiest?.name ?? "—"}
        sublabel={m.busiest ? `${m.busiest.openTasks} open tasks` : "nothing open"}
        accent="bg-amber-500/10"
      />
    </div>
  );
}
