import type { Priority } from "@mogoj/shared";

export const PRIORITY_ORDER: Record<Priority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export type SortDirection = "asc" | "desc";
export type SortAccessor<T> = (item: T) => string | number | null | undefined;

function compareByField<T>(
  a: T,
  b: T,
  direction: SortDirection,
  accessor: SortAccessor<T>,
): number {
  const av = accessor(a);
  const bv = accessor(b);
  const dir = direction === "asc" ? 1 : -1;

  if (av === null || av === undefined) return bv === null || bv === undefined ? 0 : 1;
  if (bv === null || bv === undefined) return -1;

  if (typeof av === "string" && typeof bv === "string") {
    return av.localeCompare(bv) * dir;
  }
  return ((av as number) - (bv as number)) * dir;
}

export function sortItems<T>(
  items: T[],
  field: string,
  direction: SortDirection,
  accessors: Record<string, SortAccessor<T>>,
): T[] {
  const accessor = accessors[field];
  if (!accessor) return items;
  return [...items].sort((a, b) => compareByField(a, b, direction, accessor));
}
