"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { ResourceList } from "@/components/resources/ResourceList";
import { NewResourceModal } from "@/components/resources/NewResourceModal";

export default function ResourcesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Notes, PDFs, links, and images tied to your projects and areas."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New Resource
          </Button>
        }
      />
      <ResourceList />
      <NewResourceModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
