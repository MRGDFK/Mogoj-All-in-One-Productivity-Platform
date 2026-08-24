import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  Resource,
  ResourceQuery,
  CreateResourceInput,
  UpdateResourceInput,
  PresignUploadInput,
} from "@mogoj/shared";
import { api, getApiErrorMessage } from "@/lib/api";
import { isListQueryKey } from "@/lib/queryCache";

const RESOURCES_KEY = ["resources"] as const;

// Only fields structurally identical between the write DTO and the read
// model are safe to patch optimistically — projectIds/areaIds/taskIds and
// tags carry ids/name+color that don't match Resource's embedded relation
// objects and full Tag records, so those are left for the post-settle refetch.
function toResourcePatch(input: UpdateResourceInput): Partial<Resource> {
  const patch: Partial<Resource> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.status !== undefined) patch.status = input.status;
  if (input.content !== undefined) patch.content = input.content;
  if (input.url !== undefined) patch.url = input.url;
  if (input.icon !== undefined) patch.icon = input.icon;
  return patch;
}

export function useResources(query: ResourceQuery = {}) {
  return useQuery({
    queryKey: [...RESOURCES_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Resource[]>>("/resources", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: [...RESOURCES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateResourceInput) => {
      const { data } = await api.post<ApiResponse<Resource>>("/resources", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY });
    },
  });
}

export function useUpdateResource(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateResourceInput) => {
      const { data } = await api.patch<ApiResponse<Resource>>(`/resources/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: RESOURCES_KEY });
      const patch = toResourcePatch(input);

      const previousResource = queryClient.getQueryData<Resource>([...RESOURCES_KEY, id]);
      const previousLists = queryClient.getQueriesData<Resource[]>({
        queryKey: RESOURCES_KEY,
        predicate: (query) => isListQueryKey(query.queryKey),
      });

      if (previousResource) {
        queryClient.setQueryData<Resource>([...RESOURCES_KEY, id], { ...previousResource, ...patch });
      }
      queryClient.setQueriesData<Resource[]>(
        { queryKey: RESOURCES_KEY, predicate: (query) => isListQueryKey(query.queryKey) },
        (old) => old?.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );

      return { previousResource, previousLists };
    },
    onError: (err, _input, context) => {
      if (context?.previousResource) {
        queryClient.setQueryData([...RESOURCES_KEY, id], context.previousResource);
      }
      for (const [key, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error(getApiErrorMessage(err) || "Failed to update resource");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/resources/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCES_KEY });
    },
  });
}

export function usePresignUpload() {
  return useMutation({
    mutationFn: async (input: PresignUploadInput) => {
      const { data } = await api.post<
        ApiResponse<{ uploadUrl: string; publicUrl: string; key: string }>
      >("/resources/upload-url", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}
