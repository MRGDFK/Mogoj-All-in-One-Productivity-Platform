"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Palette, Highlighter } from "lucide-react";
import type { TipTapDocument } from "@mogoj/shared";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { cn } from "@/lib/utils";

interface ResourceEditorProps {
  content: TipTapDocument | null;
  onChange: (doc: TipTapDocument) => void;
}

const TEXT_COLORS = [
  { label: "Black", value: "#18181b" },
  { label: "Gray", value: "#71717a" },
  { label: "Red", value: "#ef4444" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Green", value: "#22c55e" },
  { label: "Orange", value: "#f97316" },
  { label: "Purple", value: "#a855f7" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Blue", value: "#bfdbfe" },
];

export function ResourceEditor({ content, onChange }: ResourceEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Start writing…" }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: (content ?? { type: "doc", content: [{ type: "paragraph" }] }) as unknown as JSONContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TipTapDocument);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-64 text-foreground focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-1 border-b border-border p-2">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px shrink-0 bg-border" />

        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton active={editor.isActive("textStyle")}>
              <Palette className="h-4 w-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground hover:scale-110"
                aria-label="Default color"
              >
                ×
              </button>
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => editor.chain().focus().setColor(c.value).run()}
                  className="h-5 w-5 rounded-full border border-border/60 transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton active={editor.isActive("highlight")}>
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground hover:scale-110"
                aria-label="No highlight"
              >
                ×
              </button>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => editor.chain().focus().setHighlight({ color: c.value }).run()}
                  className="h-5 w-5 rounded-full border border-border/60 transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}
