"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useUIStore } from "@/store/useUIStore";
import { docToText, textToDoc } from "@/lib/tiptap";
import { SlideOver } from "@/components/shared/SlideOver";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { Label } from "@/components/shared/Label";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { SubtaskList } from "@/components/tasks/SubtaskList";
import { Loader } from "@/components/shared/Loader";

const NO_PROJECT = "__none__";

export function TaskDetailPanel() {
  const taskDetailId = useUIStore((s) => s.taskDetailId);
  const closeTaskDetail = useUIStore((s) => s.closeTaskDetail);
  const { data: task } = useTask(taskDetailId ?? undefined);
  const updateTask = useUpdateTask(taskDetailId ?? "");
  const deleteTask = useDeleteTask();
  const { data: projects } = useProjects({});
  const { data: areas } = useAreas({ status: "active" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(docToText(task.description));
      setTags(task.tags.join(", "));
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    }
  }, [task]);

  if (!taskDetailId) return null;

  return (
    <SlideOver open={Boolean(taskDetailId)} onOpenChange={(open) => !open && closeTaskDetail()} title="Task">
      {!task ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && updateTask.mutate({ title: title.trim() })}
            className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={task.status} onValueChange={(v) => updateTask.mutate({ status: v as never })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={task.priority} onValueChange={(v) => updateTask.mutate({ priority: v as never })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select
                value={task.projectId ?? NO_PROJECT}
                onValueChange={(v) =>
                  updateTask.mutate({ projectId: v === NO_PROJECT ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>No project</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Area</Label>
              {task.projectId ? (
                <div className="flex h-9 items-center">
                  <Badge variant="outline">
                    {areas?.find((a) => a.id === task.areaId)?.name ?? "Via project"}
                  </Badge>
                </div>
              ) : (
                <Select
                  value={task.areaId ?? undefined}
                  onValueChange={(v) => updateTask.mutate({ areaId: v })}
                >
                  <SelectTrigger>
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
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() => updateTask.mutate({ dueDate: dueDate ? new Date(dueDate) : null })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-tags">Tags</Label>
            <Input
              id="task-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onBlur={() =>
                updateTask.mutate({
                  tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="comma, separated, tags"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => updateTask.mutate({ description: description ? textToDoc(description) : null })}
              rows={5}
            />
          </div>

          {!task.parentTaskId && (
            <div className="space-y-1.5">
              <Label>Subtasks</Label>
              <SubtaskList parentTask={task} />
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              deleteTask.mutate(task.id);
              closeTaskDetail();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete task
          </Button>
        </div>
      )}
    </SlideOver>
  );
}
