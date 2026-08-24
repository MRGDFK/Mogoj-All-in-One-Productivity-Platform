import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  Area,
  AreaDashboard,
  AreaQuery,
  CreateAreaInput,
  UpdateAreaInput,
} from "@mogoj/shared";
import { api, getApiErrorMessage } from "@/lib/api";
import { isListQueryKey } from "@/lib/queryCache";

const AREAS_KEY = ["areas"] as const;

function toAreaPatch(input: UpdateAreaInput): Partial<Area> {
  const patch: Partial<Area> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.color !== undefined) patch.color = input.color;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.status !== undefined) patch.status = input.status;
  if (input.order !== undefined) patch.order = input.order;
  return patch;
}

export function useAreas(query: AreaQuery = {}) {
  return useQuery({
    queryKey: [...AREAS_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Area[]>>("/areas", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

export function useArea(id: string | undefined) {
  return useQuery({
    queryKey: [...AREAS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Area>>(`/areas/${id}`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useAreaDashboard(id: string | undefined) {
  return useQuery({
    queryKey: [...AREAS_KEY, id, "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AreaDashboard>>(`/areas/${id}/dashboard`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAreaInput) => {
      const { data } = await api.post<ApiResponse<Area>>("/areas", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AREAS_KEY });
    },
  });
}

export function useUpdateArea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAreaInput) => {
      const { data } = await api.patch<ApiResponse<Area>>(`/areas/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: AREAS_KEY });
      const patch = toAreaPatch(input);

      const previousArea = queryClient.getQueryData<Area>([...AREAS_KEY, id]);
      const previousLists = queryClient.getQueriesData<Area[]>({
        queryKey: AREAS_KEY,
        predicate: (query) => isListQueryKey(query.queryKey),
      });

      if (previousArea) {
        queryClient.setQueryData<Area>([...AREAS_KEY, id], { ...previousArea, ...patch });
      }
      queryClient.setQueriesData<Area[]>(
        { queryKey: AREAS_KEY, predicate: (query) => isListQueryKey(query.queryKey) },
        (old) => old?.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      );

      return { previousArea, previousLists };
    },
    onError: (err, _input, context) => {
      if (context?.previousArea) {
        queryClient.setQueryData([...AREAS_KEY, id], context.previousArea);
      }
      for (const [key, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error(getApiErrorMessage(err) || "Failed to update area");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: AREAS_KEY });
    },
  });
}

export function useDeleteArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/areas/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AREAS_KEY });
    },
  });
}
