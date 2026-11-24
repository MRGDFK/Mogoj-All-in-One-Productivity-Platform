// Swatch palettes. Kept dependency-free so lib/colors.test.ts can check them with plain Node.

/** Project/area icon colors: 3 rows of 8, each ≥ 3:1 against the dark background. First is the default. */
export const ICON_COLORS = [
  // cool
  "#7c9cff",
  "#60a5fa",
  "#38bdf8",
  "#22d3ee",
  "#2dd4bf",
  "#34d399",
  "#4ade80",
  "#a3e635",
  // warm
  "#facc15",
  "#fbbf24",
  "#fb923c",
  "#f87171",
  "#fb7185",
  "#f472b6",
  "#e879f9",
  "#c084fc",
  // deep + neutral
  "#a78bfa",
  "#818cf8",
  "#2563eb",
  "#059669",
  "#d97706",
  "#db2777",
  "#94a3b8",
  "#a8a29e",
];

/** Editor text colors; "no color" is the editor's separate default button. */
export const TEXT_COLORS = [
  { label: "Gray", value: "#a1a1aa" },
  { label: "Red", value: "#f87171" },
  { label: "Orange", value: "#fb923c" },
  { label: "Yellow", value: "#fde047" },
  { label: "Green", value: "#4ade80" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Purple", value: "#c084fc" },
];

/** Translucent tints so default text stays readable on top of the highlight. */
export const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "rgba(250, 204, 21, 0.28)" },
  { label: "Green", value: "rgba(74, 222, 128, 0.25)" },
  { label: "Pink", value: "rgba(244, 114, 182, 0.28)" },
  { label: "Blue", value: "rgba(96, 165, 250, 0.28)" },
];
