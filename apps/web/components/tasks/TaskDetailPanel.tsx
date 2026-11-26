"use client";

import { breatheClass } from "@/lib/priorityBreath";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar, FolderKanban, ListChecks, Trash2, X } from "lucide-react";
import { SheetContent } from "@/components/shared/Sheet";
import { EntityIcon } from "@/components/shared/EntityIcon";
import type { Area, Priority, Project, Task } from "@mogoj/shared";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { docToText, textToDoc } from "@/lib/tiptap";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { Textarea } from "@/components/shared/Textarea";
import { Loader } from "@/components/shared/Loader";
import { PriorityIcon, PRIORITY_LABELS } from "@/components/shared/PriorityIcon";
import { StatusIcon, STATUS_LABELS } from "@/components/shared/StatusIcon";
import { AreaProjectBreadcrumb } from "@/components/shared/AreaProjectBreadcrumb";
import { SubtaskList } from "@/components/tasks/SubtaskList";

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high", "critical"];
const NO_PROJECT = "__none__";
const NO_AREA = "__none__";
export function TaskDetailPanel() {
  const taskDetailId = useUIStore((s) => s.taskDetailId);
  const closeTaskDetail = useUIStore((s) => s.closeTaskDetail);
  const { data: task } = useTask(taskDetailId ?? undefined);
  const updateTask = useUpdateTask(taskDetailId ?? "");
  const deleteTask = useDeleteTask();
  const { data: projects } = useProjects({});
  const { data: areas } = useAreas({ status: "active" });

  if (!taskDetailId) return null;

  const project = task ? projects?.find((p) => p.id === task.projectId) : undefined;
  const area = task
    ? project
      ? areas?.find((a) => a.id === project.areaId)
      : areas?.find((a) => a.id === task.areaId)
    : undefined;

  return (
    <SheetContent open={Boolean(taskDetailId)} onOpenChange={(open) => !open && closeTaskDetail()}>
      {!task ? (
        <Loader className="py-16" />
      ) : (
        <TaskDetailForm
          key={task.id}
          task={task}
          area={area}
          project={project}
          areas={areas ?? []}
          projects={projects ?? []}
          updateTask={updateTask}
          deleteTask={deleteTask}
          closeTaskDetail={closeTaskDetail}
        />
      )}
    </SheetContent>
  );
}

interface TaskDetailFormProps {
  task: Task;
  area: Area | undefined;
  project: Project | undefined;
  areas: Area[];
  projects: Project[];
  updateTask: ReturnType<typeof useUpdateTask>;
  deleteTask: ReturnType<typeof useDeleteTask>;
  closeTaskDetail: () => void;
}

// Keyed by task.id from the parent, so every task gets a fresh component
// instance — local field state always starts from that task's real data
// instead of relying on an effect to re-sync and risking stale leftovers
// from whichever task was open before.
function TaskDetailForm({
  task,
  area,
  project,
  areas,
  projects,
  updateTask,
  deleteTask,
  closeTaskDetail,
}: TaskDetailFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(docToText(task.description));
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <Dialog.Title asChild>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== task.title && updateTask.mutate({ title: title.trim() })}
              className="w-full truncate border-none bg-transparent p-0 text-xl font-medium text-foreground outline-none"
            />
          </Dialog.Title>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Task workspace
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Delete task"
            onClick={() => {
              deleteTask.mutate(task.id);
              closeTaskDetail();
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-red-400"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-muted-foreground"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </Dialog.Close>
        </div>
      </div>

      <AreaProjectBreadcrumb
        areaName={area?.name}
        areaIcon={area?.icon}
        areaColor={area?.color}
        projectName={project?.name}
        projectIcon={project?.icon}
        projectColor={project?.color}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
        <div className="grid grid-cols-2 gap-4 rounded-[10px] border border-border bg-muted p-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select value={task.status} onValueChange={(v) => updateTask.mutate({ status: v as never })}>
              <SelectTrigger aria-label="Status" className="h-8 border-border bg-card px-2 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status="todo" size={16} />
                    {STATUS_LABELS.todo}
                  </span>
                </SelectItem>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status="in_progress" size={16} />
                    {STATUS_LABELS.in_progress}
                  </span>
                </SelectItem>
                <SelectItem value="in_review">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status="in_review" size={16} />
                    {STATUS_LABELS.in_review}
                  </span>
                </SelectItem>
                <SelectItem value="done">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status="done" size={16} />
                    {STATUS_LABELS.done}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Select value={task.priority} onValueChange={(v) => updateTask.mutate({ priority: v as never })}>
              <SelectTrigger aria-label="Priority" className={cn("h-8 px-2 text-sm font-medium", breatheClass(task.priority, task.status))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-1.5">
                      <PriorityIcon priority={p} />
                      {PRIORITY_LABELS[p]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Due date</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                aria-label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={() => updateTask.mutate({ dueDate: dueDate ? new Date(`${dueDate}T12:00:00Z`) : null })}
                className={cn(
                  "border-none bg-transparent p-0 text-sm font-medium outline-none",
                  !dueDate && "text-muted-foreground",
                )}
              />
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Area</span>
            <div className="flex items-center gap-2">
              <Select
                value={task.areaId ?? NO_AREA}
                onValueChange={(v) => updateTask.mutate({ areaId: v === NO_AREA ? null : v })}
              >
                <SelectTrigger aria-label="Area" className="h-8 border-border bg-card px-2 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_AREA}>No area</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-1.5">
                        <EntityIcon icon={a.icon} color={a.color} size={14} />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Project</span>
            <div className="flex items-center gap-2">
              <Select
                value={task.projectId ?? NO_PROJECT}
                onValueChange={(v) => updateTask.mutate({ projectId: v === NO_PROJECT ? null : v })}
              >
                <SelectTrigger aria-label="Project" className="h-8 border-border bg-card px-2 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-1.5">
                        <EntityIcon icon={p.icon} color={p.color} size={14} fallback={FolderKanban} />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs text-muted-foreground">Description</p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => updateTask.mutate({ description: description ? textToDoc(description) : null })}
            placeholder="No description"
            className="min-h-[60px] rounded-[10px] border-border bg-muted text-sm"
          />
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <div className="mb-1 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Subtasks</span>
          </div>
          <p className="mb-2.5 text-xs text-muted-foreground">Break work into smaller steps</p>
          <SubtaskList parentTask={task} />
        </div>
      </div>
    </>
  );
}
