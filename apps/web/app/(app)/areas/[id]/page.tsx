"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, Pencil, Plus } from "lucide-react";
import { createTaskSchema } from "@mogoj/shared";
import { useArea, useDeleteArea, useUpdateArea } from "@/hooks/useAreas";
import { useCreateTask } from "@/hooks/useTasks";
import { getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { EditableTitle } from "@/components/shared/EditableTitle";
import { NAME_MAX } from "@/lib/entityName";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
import { AreaDashboard } from "@/components/areas/AreaDashboard";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { NewResourceModal } from "@/components/resources/NewResourceModal";
import { IconPicker } from "@/components/shared/IconPicker";
import { toast } from "sonner";

export default function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: area, isLoading } = useArea(id);
  const updateArea = useUpdateArea(id);
  const deleteArea = useDeleteArea();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newResourceOpen, setNewResourceOpen] = useState(false);

  if (isLoading || !area) return <Loader label="Loading area…" />;

  async function handleDelete() {
    try {
      await deleteArea.mutateAsync(id);
      router.push("/areas");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmOpen(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={
          <EditableTitle
            key={`${area.id}:${area.name}`}
            name={area.name}
            maxLength={NAME_MAX.area}
            label="Area name"
            onRename={(name) => updateArea.mutate({ name })}
          />
        }
        description={area.description ?? undefined}
        icon={
          <IconPicker
            icon={area.icon}
            color={area.color}
            triggerSize={44}
            onChange={(next) => updateArea.mutate(next)}
          />
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => updateArea.mutate({ status: "archived" })}>
              <Archive className="h-4 w-4" />
              Archive
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setNewProjectOpen(true)}>
          <Plus className="h-4 w-4" />
          Add project
        </Button>
        <Button variant="outline" size="sm" onClick={() => setNewTaskOpen(true)}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
        <Button variant="outline" size="sm" onClick={() => setNewResourceOpen(true)}>
          <Plus className="h-4 w-4" />
          Add resource
        </Button>
      </div>

      <AreaDashboard areaId={id} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this area?"
        description="This can't be undone. Areas with active projects, tasks, or resources can't be deleted — archive or move them first."
        confirmLabel="Delete"
        destructive
        isLoading={deleteArea.isPending}
        onConfirm={handleDelete}
      />

      <EditAreaModal
        open={editOpen}
        onOpenChange={setEditOpen}
        name={area.name}
        description={area.description}
        onSave={(input) => updateArea.mutate(input)}
      />

      <NewProjectModal open={newProjectOpen} onOpenChange={setNewProjectOpen} lockedAreaId={id} />
      <NewAreaTaskModal open={newTaskOpen} onOpenChange={setNewTaskOpen} areaId={id} />
      <NewResourceModal open={newResourceOpen} onOpenChange={setNewResourceOpen} lockedAreaId={id} />
    </div>
  );
}

function EditAreaModal({
  open,
  onOpenChange,
  name: initialName,
  description: initialDescription,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string | null;
  onSave: (input: { name: string; description?: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription ?? "");
    }
  }, [open, initialName, initialDescription]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined });
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit area">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-area-name">Name</Label>
          <Input id="edit-area-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-area-description">Description (optional)</Label>
          <Textarea
            id="edit-area-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function NewAreaTaskModal({
  open,
  onOpenChange,
  areaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId: string;
}) {
  const createTask = useCreateTask();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createTaskSchema.safeParse({ title, areaId, status: "todo", priority: "medium" });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createTask.mutateAsync(parsed.data);
      setTitle("");
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New task">
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="area-task-title">Title</Label>
          <Input id="area-task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
