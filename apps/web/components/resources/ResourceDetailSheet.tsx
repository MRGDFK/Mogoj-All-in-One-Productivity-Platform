"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, Trash2, X, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Resource, ResourceStatus, TipTapDocument } from "@mogoj/shared";
import { useResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useNotes, useLinkNoteToResource } from "@/hooks/useNotes";
import { useUIStore } from "@/store/useUIStore";
import { getApiErrorMessage } from "@/lib/api";
import { SheetContent } from "@/components/shared/Sheet";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { EntityIcon } from "@/components/shared/EntityIcon";
import { IconPicker } from "@/components/shared/IconPicker";
import { TagPicker } from "@/components/shared/TagPicker";
import { ResourceEditor } from "@/components/resources/ResourceEditor";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDetailSheet } from "@/components/notes/NoteDetailSheet";
import { NewNoteModal } from "@/components/notes/NewNoteModal";
import { useResources } from "@/hooks/useResources";
import { RESOURCE_TYPE_ICONS } from "@/lib/resourceIcons";

const RESOURCE_ICON_COLOR = "#525252";

const STATUS_OPTIONS: { label: string; value: ResourceStatus }[] = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

export function ResourceDetailSheet() {
  const resourceDetailId = useUIStore((s) => s.resourceDetailId);
  const closeResourceDetail = useUIStore((s) => s.closeResourceDetail);
  const { data: resource, isLoading } = useResource(resourceDetailId ?? undefined);
  const updateResource = useUpdateResource(resourceDetailId ?? "");
  const deleteResource = useDeleteResource();

  return (
    <SheetContent
      open={resourceDetailId !== null}
      onOpenChange={(open) => !open && closeResourceDetail()}
      className="w-full max-w-[600px]"
    >
      {isLoading || !resource ? (
        <Loader label="Loading resource…" className="py-16" />
      ) : (
        <ResourceDetailForm
          key={resource.id}
          resource={resource}
          updateResource={updateResource}
          deleteResource={deleteResource}
          onClose={closeResourceDetail}
        />
      )}
    </SheetContent>
  );
}

interface ResourceDetailFormProps {
  resource: Resource;
  updateResource: ReturnType<typeof useUpdateResource>;
  deleteResource: ReturnType<typeof useDeleteResource>;
  onClose: () => void;
}

// Keyed by resource.id from the parent, so every resource gets a fresh
// component instance — local title state always starts from that
// resource's real data instead of relying on an effect to re-sync.
function ResourceDetailForm({ resource, updateResource, deleteResource, onClose }: ResourceDetailFormProps) {
  const [title, setTitle] = useState(resource.title);
  const [url, setUrl] = useState(resource.url ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const contentSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: areas } = useAreas({ status: "active" });
  const { data: projects } = useProjects({});
  const { data: tasks } = useTasks({ topLevelOnly: true });
  const { data: notes } = useNotes({ resourceId: resource.id });
  const { data: allNotes } = useNotes({});
  const { data: allResources } = useResources({});
  const linkNoteToResource = useLinkNoteToResource();

  const allTags = (() => {
    const seen = new Map<string, { name: string; color: string }>();
    for (const r of allResources ?? []) {
      for (const t of r.tags) {
        if (!seen.has(t.name)) seen.set(t.name, t);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  function handleContentChange(doc: TipTapDocument) {
    if (contentSaveTimeout.current) clearTimeout(contentSaveTimeout.current);
    contentSaveTimeout.current = setTimeout(() => {
      updateResource.mutate({ content: doc });
    }, 800);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    if (urlSaveTimeout.current) clearTimeout(urlSaveTimeout.current);
    urlSaveTimeout.current = setTimeout(() => {
      updateResource.mutate({ url: value.trim() || null });
    }, 800);
  }

  async function handleDelete() {
    try {
      await deleteResource.mutateAsync(resource.id);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Resource workspace
            </span>
            <Link
              href={`/resources/${resource.id}`}
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open full page
              <Maximize2 className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <IconPicker
              icon={resource.icon ?? ""}
              color={RESOURCE_ICON_COLOR}
              triggerSize={28}
              fallback={RESOURCE_TYPE_ICONS[resource.type]}
              onChange={(next) => next.icon !== undefined && updateResource.mutate({ icon: next.icon || null })}
            />
            <Dialog.Title asChild>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => title.trim() && title !== resource.title && updateResource.mutate({ title: title.trim() })}
                className="w-full truncate border-none bg-transparent p-0 text-lg font-medium outline-none"
              />
            </Dialog.Title>
          </div>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </Dialog.Close>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-5">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status</span>
            <Select
              value={resource.status}
              onValueChange={(v) => updateResource.mutate({ status: v as ResourceStatus })}
            >
              <SelectTrigger className="h-7 w-28 px-2 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-5 w-px shrink-0 bg-border" />

          <div className="flex min-w-[180px] flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">URL</span>
            <Input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://…"
              className="h-7 flex-1 border-none bg-transparent px-0 text-xs font-medium shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="h-5 w-px shrink-0 bg-border" />

          <div className="flex min-w-[180px] flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">Tags</span>
            <TagPicker
              tags={resource.tags}
              allTags={allTags}
              onChange={(tags) => updateResource.mutate({ tags })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <PillMultiSelect
            label="Areas"
            options={(areas ?? []).map((a) => ({ id: a.id, label: a.name, icon: a.icon, color: a.color }))}
            selectedIds={resource.areas.map((a) => a.id)}
            onChange={(ids) => updateResource.mutate({ areaIds: ids })}
          />
          <PillMultiSelect
            label="Projects"
            options={(projects ?? []).map((p) => ({ id: p.id, label: p.name, icon: p.icon, color: p.color }))}
            selectedIds={resource.projects.map((p) => p.id)}
            onChange={(ids) => updateResource.mutate({ projectIds: ids })}
          />
          <PillMultiSelect
            label="Tasks"
            options={(tasks ?? []).map((t) => ({ id: t.id, label: t.title }))}
            selectedIds={resource.tasks.map((t) => t.id)}
            onChange={(ids) => updateResource.mutate({ taskIds: ids })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground">Linked notes</h4>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setNewNoteOpen(true)}
                  className="h-6 rounded px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  + New
                </button>
                <Popover open={linkPopoverOpen} onOpenChange={(open) => { setLinkPopoverOpen(open); setLinkSearch(""); }}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-6 rounded px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      Link
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-1">
                    <Input
                      value={linkSearch}
                      onChange={(e) => setLinkSearch(e.target.value)}
                      placeholder="Search notes…"
                      className="h-7 border-none text-xs"
                      autoFocus
                    />
                    <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
                      {(allNotes ?? [])
                        .filter((n) => n.resourceId !== resource.id)
                        .filter((n) => n.title.toLowerCase().includes(linkSearch.toLowerCase()))
                        .map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={async () => {
                              try {
                                await linkNoteToResource.mutateAsync({ noteId: n.id, resourceId: resource.id });
                                setLinkPopoverOpen(false);
                                toast.success("Note linked");
                              } catch (err) {
                                toast.error(getApiErrorMessage(err));
                              }
                            }}
                            className="flex w-full items-center gap-2 rounded-sm px-1.5 py-1 text-left text-sm hover:bg-accent"
                          >
                            <span className="truncate text-xs">{n.title}</span>
                          </button>
                        ))}
                      {((allNotes ?? []).filter((n) => n.resourceId !== resource.id && n.title.toLowerCase().includes(linkSearch.toLowerCase())).length === 0) && (
                        <p className="px-1.5 py-1 text-xs text-muted-foreground">No notes to link</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-1.5">
              {notes && notes.length > 0 ? (
                notes.map((note) => <NoteCard key={note.id} note={note} onClick={() => setActiveNoteId(note.id)} />)
              ) : (
                <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                  No linked notes
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-medium text-muted-foreground">Web links</h4>
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-border p-3 text-xs text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{resource.url}</span>
              </a>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                No links
              </p>
            )}
          </div>
        </div>

        <ResourceEditor content={resource.content} onChange={handleContentChange} />

        <Button
          variant="destructive"
          size="sm"
          className="w-fit"
          onClick={() => setConfirmOpen(true)}
          disabled={deleteResource.isPending}
        >
          <Trash2 className="h-4 w-4" />
          Delete resource
        </Button>
      </div>

      <NoteDetailSheet noteId={activeNoteId} onOpenChange={(open) => !open && setActiveNoteId(null)} />

      <NewNoteModal
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
        resourceId={resource.id}
        onCreated={(note) => setActiveNoteId(note.id)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this resource?"
        description="This permanently deletes the resource."
        confirmLabel="Delete"
        destructive
        isLoading={deleteResource.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

interface PillOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

function PillMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
}: {
  label: string;
  options: PillOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const selected = options.filter((o) => selectedIds.includes(o.id));

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      {selected.map((o) => (
        <span
          key={o.id}
          className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          {o.icon && <EntityIcon icon={o.icon} color={o.color} size={10} />}
          {o.label}
        </span>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            aria-label={`Add ${label.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-1">
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {options.length ? (
              options.map((o) => (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={() => toggle(o.id)}
                    className="h-3.5 w-3.5 rounded border-input"
                  />
                  {o.icon && <EntityIcon icon={o.icon} color={o.color} size={14} />}
                  {o.label}
                </label>
              ))
            ) : (
              <p className="px-1.5 py-1 text-sm text-muted-foreground">Nothing to link</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
