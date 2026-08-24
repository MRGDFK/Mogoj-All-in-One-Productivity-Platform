"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InboxCapture } from "@/components/inbox/InboxCapture";
import { InboxList } from "@/components/inbox/InboxList";
import { ProcessModal } from "@/components/inbox/ProcessModal";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "captured", label: "Unprocessed" },
  { value: "processed", label: "Processed" },
] as const;

export default function InboxPage() {
  const [tab, setTab] = useState<"captured" | "processed">("captured");

  return (
    <div>
      <PageHeader title="Inbox" description="Capture first, organize later." />

      <InboxCapture />

      <div className="mb-3 mt-3 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <InboxList status={tab} />
      <ProcessModal />
    </div>
  );
}
