"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AuthUser } from "@mogoj/shared";
import { ME_QUERY_KEY, useMe, useUpdateProfile } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import { readShortcut, withShortcut, type Shortcut } from "@/lib/shortcut";

/** The user's quick-capture shortcut plus an optimistic setter (null = back to default). */
export function useQuickCaptureShortcut() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const { mutate } = useUpdateProfile();
  const shortcut = useMemo(() => readShortcut(me?.preferences), [me?.preferences]);

  const setShortcut = useCallback(
    (next: Shortcut | null) => {
      const current = queryClient.getQueryData<AuthUser | null>(ME_QUERY_KEY);
      if (!current) return;
      // PATCH /auth/profile replaces preferences wholesale, so always send the merged object
      const preferences = withShortcut(current.preferences, next);
      queryClient.setQueryData(ME_QUERY_KEY, { ...current, preferences });
      mutate(
        { preferences },
        {
          onSuccess: () => toast.success("Shortcut saved"),
          onError: (err) => {
            queryClient.setQueryData(ME_QUERY_KEY, current);
            toast.error(getApiErrorMessage(err) || "Couldn't save shortcut");
          },
        },
      );
    },
    [queryClient, mutate],
  );

  return { shortcut, setShortcut };
}
