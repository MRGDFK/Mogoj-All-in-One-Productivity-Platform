import type { QueryKey } from "@tanstack/react-query";

// Every domain hook in this app follows the same key shape: [entityKey, id]
// for a single-item query, [entityKey, filterObject] for a list query, and
// [entityKey, id, "kanban" | "dashboard"] for nested derived views. Optimistic
// list patches must only touch the filterObject shape — matching on
// Array.isArray(data) alone isn't enough, since some derived views (e.g. a
// project's kanban columns) are also arrays but keyed and shaped differently.
export function isListQueryKey(key: QueryKey): boolean {
  return key.length === 2 && typeof key[1] === "object" && key[1] !== null;
}
