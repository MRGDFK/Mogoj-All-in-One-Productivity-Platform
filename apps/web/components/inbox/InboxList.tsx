"use client";

import { Inbox } from "lucide-react";
import { useInboxItems } from "@/hooks/useInbox";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { InboxItemCard } from "@/components/inbox/InboxItemCard";

export function InboxList({ status }: { status?: "captured" | "processed" }) {
  const { data: items, isLoading } = useInboxItems(status ? { status } : {});

  if (isLoading) return <Loader label="Loading inbox…" />;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Inbox zero"
        description="Capture anything above — process it later into a task, project, or resource."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <InboxItemCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
