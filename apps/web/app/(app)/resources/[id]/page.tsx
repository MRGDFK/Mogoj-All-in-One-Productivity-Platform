"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, Folder, FolderKanban, Link as LinkIcon, Tag as TagIcon, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { ResourceStatus, TipTapDocument } from "@mogoj/shared";
import { useResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useNotes, useLinkNoteToResource } from "@/hooks/useNotes";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Label } from "@/components/shared/Label";
import { Loader } from "@/components/shared/Loader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/shared/Command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";
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

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: resource, isLoading } = useResource(id);
  const updateResource = useUpdateResource(id);
  const deleteResource = useDeleteResource();
  const { data: projects } = useProjects({});
  const { data: areas } = useAreas({ status: "active" });
  const { data: notes } = useNotes({ resourceId: id });
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

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setUrl(resource.url ?? "");
    }
  }, [resource]);

  if (isLoading || !resource) return <Loader label="Loading resource…" />;

  function handleContentChange(doc: TipTapDocument) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
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
      await deleteResource.mutateAsync(id);
      router.push("/resources");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2 h-8 text-xs text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
        Back
      </Button>

      <div className="mb-2 flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <IconPicker
          icon={resource.icon ?? ""}
          color={RESOURCE_ICON_COLOR}
          triggerSize={32}
          fallback={RESOURCE_TYPE_ICONS[resource.type]}
          onChange={(next) => next.icon !== undefined && updateResource.mutate({ icon: next.icon || null })}
        />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== resource.title && updateResource.mutate({ title: title.trim() })}
          className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="mb-4 divide-y divide-border/60 glass rounded-2xl">
        <div className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <LinkIcon className="h-4 w-4" />
            URL
          </span>
          <Input
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://…"
            className="h-8 max-w-[280px] border-none bg-transparent text-right text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <TagIcon className="h-4 w-4" />
            Tags
          </span>
          <TagPicker
            tags={resource.tags}
            allTags={allTags}
            onChange={(tags) => updateResource.mutate({ tags })}
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderKanban className="h-4 w-4" />
            Projects
          </span>
          <EntityLinkPicker
            options={(projects ?? []).map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.color }))}
            selectedIds={resource.projects.map((p) => p.id)}
            onChange={(ids) => updateResource.mutate({ projectIds: ids })}
            fallback={FolderKanban}
            emptyLabel="No projects"
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Folder className="h-4 w-4" />
            Areas
          </span>
          <EntityLinkPicker
            options={(areas ?? []).map((a) => ({ id: a.id, name: a.name, icon: a.icon, color: a.color }))}
            selectedIds={resource.areas.map((a) => a.id)}
            onChange={(ids) => updateResource.mutate({ areaIds: ids })}
            emptyLabel="No areas"
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Status
          </span>
          <Select
            value={resource.status}
            onValueChange={(v) => updateResource.mutate({ status: v as ResourceStatus })}
          >
            <SelectTrigger className="h-8 w-28 text-sm">
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
      </div>

      <div className="mb-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Linked notes</Label>
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
                    .filter((n) => n.resourceId !== id)
                    .filter((n) => n.title.toLowerCase().includes(linkSearch.toLowerCase()))
                    .map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={async () => {
                          try {
                            await linkNoteToResource.mutateAsync({ noteId: n.id, resourceId: id });
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
                  {((allNotes ?? []).filter((n) => n.resourceId !== id && n.title.toLowerCase().includes(linkSearch.toLowerCase())).length === 0) && (
                    <p className="px-1.5 py-1 text-xs text-muted-foreground">No notes to link</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-1.5">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <NoteCard key={note.id} note={note} onClick={() => setActiveNoteId(note.id)} />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              No linked notes
            </p>
          )}
        </div>
      </div>

      <ResourceEditor content={resource.content} onChange={handleContentChange} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this resource?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteResource.isPending}
        onConfirm={handleDelete}
      />

      <NoteDetailSheet noteId={activeNoteId} onOpenChange={(open) => !open && setActiveNoteId(null)} />

      <NewNoteModal
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
        resourceId={id}
        onCreated={(note) => setActiveNoteId(note.id)}
      />
    </div>
  );
}

interface EntityLinkOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Compact "which entities is this linked to" control: shows selected items as
// pills (or a muted placeholder), and opens a searchable Command list on click
// to toggle membership — used for both the Projects and Areas rows.
function EntityLinkPicker({
  options,
  selectedIds,
  onChange,
  fallback,
  emptyLabel,
}: {
  options: EntityLinkOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  fallback?: LucideIcon;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => selectedIds.includes(o.id));

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex max-w-[280px] flex-wrap items-center justify-end gap-1 rounded-md px-1 py-0.5 hover:bg-accent"
        >
          {selected.length > 0 ? (
            selected.map((o) => (
              <span
                key={o.id}
                className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <EntityIcon icon={o.icon} color={o.color} size={10} fallback={fallback} />
                {o.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">{emptyLabel}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>Nothing found</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.id} value={o.name} onSelect={() => toggle(o.id)}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    readOnly
                    className="h-3.5 w-3.5 rounded border-input"
                  />
                  <EntityIcon icon={o.icon} color={o.color} size={14} fallback={fallback} />
                  {o.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
