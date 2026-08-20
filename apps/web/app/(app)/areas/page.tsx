"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createAreaSchema } from "@mogoj/shared";
import { useCreateArea } from "@/hooks/useAreas";
import { getApiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
import { AreaGrid } from "@/components/areas/AreaGrid";

export default function AreasPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createArea = useCreateArea();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createAreaSchema.safeParse({
      name,
      description: description || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      await createArea.mutateAsync(parsed.data);
      setName("");
      setDescription("");
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

      <AreaGrid />

      <Modal open={open} onOpenChange={setOpen} title="New area">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Name</Label>
            <Input id="area-name" value={name} onChange={(e) => setName(e.target.value)} required />
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
