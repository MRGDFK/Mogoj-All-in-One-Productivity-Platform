/**
 * Where Kanban quick-add files new tasks on the global /tasks board.
 * Encoded as "area:<id>" | "project:<id>" so it fits one <Select> value and localStorage.
 * There is deliberately no default: a task is never filed somewhere the user didn't pick.
 */
export type QuickAddKind = "area" | "project";

export const QUICK_ADD_STORAGE_KEY = "mogoj:quickAddTarget";

export function encodeQuickAddTarget(kind: QuickAddKind, id: string): string {
  return `${kind}:${id}`;
}

export function parseQuickAddTarget(value: string | null | undefined): { areaId: string } | { projectId: string } | null {
  const match = /^(area|project):(.+)$/.exec(value ?? "");
  if (!match) return null;
  return match[1] === "area" ? { areaId: match[2]! } : { projectId: match[2]! };
}

/** The remembered target if it still points at an existing area/project, otherwise null. */
export function resolveStoredTarget(
  stored: string | null | undefined,
  areas: { id: string }[],
  projects: { id: string }[],
): string | null {
  const parsed = parseQuickAddTarget(stored);
  if (!parsed) return null;
  const exists = "areaId" in parsed ? areas.some((a) => a.id === parsed.areaId) : projects.some((p) => p.id === parsed.projectId);
  return exists ? stored! : null;
}
