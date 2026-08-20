import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  Resource,
  ResourceQuery,
  CreateResourceInput,
  UpdateResourceInput,
  PresignUploadInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const RESOURCES_KEY = ["resources"] as const;

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
    onSuccess: () => {
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
