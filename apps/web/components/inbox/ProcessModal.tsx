"use client";

import { useMemo, useState } from "react";
import type { ProcessInboxItemInput } from "@mogoj/shared";
import { useInboxItems, useProcessInboxItem } from "@/hooks/useInbox";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/store/useUIStore";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { Label } from "@/components/shared/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/Select";
import { getApiErrorMessage } from "@/lib/api";

type Target = ProcessInboxItemInput["target"];

const TARGET_OPTIONS: { value: Target; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "project", label: "Project" },
  { value: "resource", label: "Resource" },
  { value: "discard", label: "Discard" },
];

export function ProcessModal() {
  const processInboxItemId = useUIStore((s) => s.processInboxItemId);
  const closeProcessModal = useUIStore((s) => s.closeProcessModal);

  const { data: items } = useInboxItems({});
  const item = items?.find((i) => i.id === processInboxItemId);

  const { data: areas } = useAreas({ status: "active" });
  const { data: projects } = useProjects({});

  const [target, setTarget] = useState<Target>("task");
  const [areaId, setAreaId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const processItem = useProcessInboxItem(processInboxItemId ?? "");

  const projectsInArea = useMemo(
    () => (areaId ? projects?.filter((p) => p.areaId === areaId) : projects),
    [projects, areaId],
  );

  function reset() {
    setTarget("task");
    setAreaId("");
    setProjectId("");
    setError(null);
  }

  async function handleSubmit() {
    setError(null);

    let input: ProcessInboxItemInput;
    if (target === "discard") {
      input = { target: "discard" };
    } else if (target === "project") {
      if (!areaId) {
        setError("Choose an area for the new project");
        return;
      }
      input = { target: "project", areaId };
    } else {
      if (!areaId && !projectId) {
        setError("Assign this to a project or an area");
        return;
      }
      input = {
        target,
        ...(projectId ? { projectId } : { areaId }),
      };
    }

    try {
      await processItem.mutateAsync(input);
      reset();
      closeProcessModal();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (!item) return null;

  return (
    <Modal
      open={Boolean(processInboxItemId)}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          closeProcessModal();
        }
      }}
      title="Process inbox item"
      description={item.title}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Promote to</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {TARGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTarget(opt.value)}
                className={`rounded-md border px-2 py-1.5 text-sm ${
                  target === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {target !== "discard" && (
          <div className="space-y-1.5">
            <Label>Area{target === "project" && " (required)"}</Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger aria-label="Area">
                <SelectValue placeholder="Choose an area" />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(target === "task" || target === "resource") && (
          <div className="space-y-1.5">
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger aria-label="Project">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projectsInArea?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={closeProcessModal}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={processItem.isPending}>
            {target === "discard" ? "Discard" : "Promote"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
