export interface TagColor {
  name: string;
  bg: string;
  text: string;
  border: string;
  swatch: string;
}

export const TAG_COLORS: TagColor[] = [
  { name: "gray", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200/60", swatch: "bg-gray-400" },
  { name: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200/60", swatch: "bg-blue-400" },
  {
    name: "emerald",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200/60",
    swatch: "bg-emerald-400",
  },
  { name: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/60", swatch: "bg-amber-400" },
  { name: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200/60", swatch: "bg-rose-400" },
];

export function tagColorClass(colorName: string): string {
  const found = TAG_COLORS.find((c) => c.name === colorName);
  if (found) return `${found.bg} ${found.text} border ${found.border}`;
  // Fallback: treat as full Tailwind classes (for backward compat)
  return colorName;
}

export function getDefaultColor(tagName: string): string {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) hash = (hash * 31 + tagName.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length]!.name;
}
