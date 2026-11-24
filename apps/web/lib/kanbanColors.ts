import type { ColumnVisual } from "../components/projects/kanbanColumns";

export type KanbanBoardKind = "task" | "project";
type Prefs = Record<string, unknown>;

const HEX = /^#[0-9a-fA-F]{6}$/;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** User overrides for one board, keeping only valid #rrggbb values (preferences is free-form JSON). */
export function readColumnColors(prefs: unknown, board: KanbanBoardKind): Record<string, string> {
  const all = isRecord(prefs) ? prefs.kanbanColors : undefined;
  const raw = isRecord(all) ? all[board] : undefined;
  if (!isRecord(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter((e): e is [string, string] => typeof e[1] === "string" && HEX.test(e[1])),
  );
}

export function resolveVisuals<S extends string>(
  defaults: Record<S, ColumnVisual>,
  overrides: Record<string, string>,
): Record<S, ColumnVisual> {
  const out = { ...defaults };
  for (const status of Object.keys(defaults) as S[]) {
    const color = overrides[status];
    if (color) out[status] = { ...defaults[status], color };
  }
  return out;
}

/** New preferences object with one column color set, or removed when `color` is null. */
export function withColumnColor(prefs: Prefs | undefined, board: KanbanBoardKind, status: string, color: string | null): Prefs {
  if (color !== null && !HEX.test(color)) throw new Error(`Invalid color: ${color}`);
  const base = prefs ?? {};
  const all = isRecord(base.kanbanColors) ? base.kanbanColors : {};
  const colors = readColumnColors(base, board);
  if (color === null) delete colors[status];
  else colors[status] = color;
  return { ...base, kanbanColors: { ...all, [board]: colors } };
}
