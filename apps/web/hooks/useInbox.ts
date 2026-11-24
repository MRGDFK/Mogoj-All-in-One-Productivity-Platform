import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  InboxItem,
  InboxQuery,
  CreateInboxItemInput,
  UpdateInboxItemInput,
  ProcessInboxItemInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const INBOX_KEY = ["inbox"] as const;

export function useInboxItems(query: InboxQuery = {}) {
  return useQuery({
    queryKey: [...INBOX_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<InboxItem[]>>("/inbox", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

// Polls lightly so the sidebar badge stays fresh even if the inbox is
// processed from another tab/device.
export function useUnprocessedInboxCount() {
  return useQuery({
    queryKey: [...INBOX_KEY, "unprocessed-count"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<InboxItem[]>>("/inbox", {
        params: { status: "captured" },
      });
      if (!data.success) throw new Error(data.message);
      return data.data.length;
    },
    refetchInterval: 60 * 1000,
  });
}

function useInvalidateInbox() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: INBOX_KEY });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCreateInboxItem() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: async (input: CreateInboxItemInput) => {
      const { data } = await api.post<ApiResponse<InboxItem>>("/inbox", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateInboxItem(id: string) {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: async (input: UpdateInboxItemInput) => {
      const { data } = await api.patch<ApiResponse<InboxItem>>(`/inbox/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteInboxItem() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/inbox/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: invalidate,
  });
}

export function useProcessInboxItem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProcessInboxItemInput) => {
      const { data } = await api.post<ApiResponse<InboxItem>>(`/inbox/${id}/process`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INBOX_KEY });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
