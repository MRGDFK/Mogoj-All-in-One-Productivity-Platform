import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  Area,
  AreaDashboard,
  AreaQuery,
  CreateAreaInput,
  UpdateAreaInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const AREAS_KEY = ["areas"] as const;

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
    onSuccess: () => {
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
