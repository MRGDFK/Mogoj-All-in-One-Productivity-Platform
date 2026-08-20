import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  Project,
  KanbanColumn,
  ProjectQuery,
  CreateProjectInput,
  UpdateProjectInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const PROJECTS_KEY = ["projects"] as const;

export function useProjects(query: ProjectQuery = {}) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>("/projects", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useProjectKanban(id: string | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id, "kanban"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<KanbanColumn[]>>(`/projects/${id}/kanban`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data } = await api.post<ApiResponse<Project>>("/projects", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => {
      const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// Used by the Projects Kanban board's drag-and-drop, where the moved
// project's id is only known at drop time — unlike useUpdateProject, it
// isn't bound to one project up front.
export function useMoveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: string; order: number }) => {
      const { data } = await api.patch<ApiResponse<Project>>(`/projects/${vars.id}`, {
        status: vars.status,
        order: vars.order,
      });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/projects/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}
