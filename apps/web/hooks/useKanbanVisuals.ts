"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AuthUser } from "@mogoj/shared";
import { ME_QUERY_KEY, useMe, useUpdateProfile } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import { readColumnColors, resolveVisuals, withColumnColor, type KanbanBoardKind } from "@/lib/kanbanColors";
import type { ColumnVisual } from "@/components/projects/kanbanColumns";

/** Column visuals with the user's saved colors applied, plus an optimistic setter (null = reset). */
export function useKanbanVisuals<S extends string>(board: KanbanBoardKind, defaults: Record<S, ColumnVisual>) {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const { mutate } = useUpdateProfile();

  const visuals = useMemo(
    () => resolveVisuals(defaults, readColumnColors(me?.preferences, board)),
    [defaults, me?.preferences, board],
  );

  const setColor = useCallback(
    (status: string, color: string | null) => {
      // Read the cache, not a closure, so quick successive picks don't clobber each other
      const current = queryClient.getQueryData<AuthUser | null>(ME_QUERY_KEY);
      if (!current) return;
      // PATCH /auth/profile replaces preferences wholesale, so always send the merged object
      const preferences = withColumnColor(current.preferences, board, status, color);
      queryClient.setQueryData(ME_QUERY_KEY, { ...current, preferences });
      mutate(
        { preferences },
        {
          onError: (err) => {
            queryClient.setQueryData(ME_QUERY_KEY, current);
            toast.error(getApiErrorMessage(err) || "Couldn't save column color");
          },
        },
      );
    },
    [queryClient, mutate, board],
  );

  return { visuals, setColor };
}
