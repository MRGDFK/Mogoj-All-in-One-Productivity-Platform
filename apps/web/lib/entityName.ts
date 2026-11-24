/** Mirrors `name` in packages/shared project/area schemas; entityName.test.ts fails if they drift. */
export const NAME_MAX = { project: 150, area: 100 } as const;

/** The name to save after an inline edit, or null when there is nothing valid to save. */
export function resolveRename(draft: string, current: string, max: number): string | null {
  const next = draft.trim();
  if (!next || next === current || next.length > max) return null;
  return next;
}
