"use client";

import type { InboxItem } from "@mogoj/shared";
import { Trash2, Check } from "lucide-react";
import { useDeleteInboxItem } from "@/hooks/useInbox";
import { useUIStore } from "@/store/useUIStore";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { docToText } from "@/lib/tiptap";
import { formatRelativeTime } from "@/lib/utils";

export function InboxItemCard({ item }: { item: InboxItem }) {
  const deleteItem = useDeleteInboxItem();
  const openProcessModal = useUIStore((s) => s.openProcessModal);
  const bodyText = docToText(item.body);

  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {item.type}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
        </div>
        <p className="truncate text-sm font-medium">{item.title}</p>
        {bodyText && <p className="mt-0.5 truncate text-sm text-muted-foreground">{bodyText}</p>}
      </div>

      {item.status === "captured" ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={() => openProcessModal(item.id)}>
            <Check className="h-3.5 w-3.5" />
            Process
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteItem.mutate(item.id)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Badge variant="success" className="shrink-0">
          Processed
        </Badge>
      )}
    </li>
  );
}
