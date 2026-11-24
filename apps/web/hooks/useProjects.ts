import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  Project,
  KanbanColumn,
  ProjectQuery,
  CreateProjectInput,
  UpdateProjectInput,
} from "@mogoj/shared";
import { api, getApiErrorMessage } from "@/lib/api";
import { isListQueryKey } from "@/lib/queryCache";

const PROJECTS_KEY = ["projects"] as const;

// Only fields structurally identical between the write DTO and the read
// model are safe to patch optimistically — areaId stays a bare string on
// both sides, but Project embeds a resolved `area` object that this input
// doesn't carry, so a reassignment still needs the post-settle refetch.
function toProjectPatch(input: UpdateProjectInput): Partial<Project> {
  const patch: Partial<Project> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.color !== undefined) patch.color = input.color;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.status !== undefined) patch.status = input.status;
  if (input.areaId !== undefined) patch.areaId = input.areaId;
  if (input.coverImage !== undefined) patch.coverImage = input.coverImage;
  if (input.order !== undefined) patch.order = input.order;
  if (input.startDate !== undefined) patch.startDate = input.startDate ? input.startDate.toISOString() : null;
  if (input.endDate !== undefined) patch.endDate = input.endDate ? input.endDate.toISOString() : null;
  return patch;
}

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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_KEY });
      const patch = toProjectPatch(input);

      const previousProject = queryClient.getQueryData<Project>([...PROJECTS_KEY, id]);
      const previousLists = queryClient.getQueriesData<Project[]>({
        queryKey: PROJECTS_KEY,
        predicate: (query) => isListQueryKey(query.queryKey),
      });

      if (previousProject) {
        queryClient.setQueryData<Project>([...PROJECTS_KEY, id], { ...previousProject, ...patch });
      }
      queryClient.setQueriesData<Project[]>(
        { queryKey: PROJECTS_KEY, predicate: (query) => isListQueryKey(query.queryKey) },
        (old) => old?.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );

      return { previousProject, previousLists };
    },
    onError: (err, _input, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData([...PROJECTS_KEY, id], context.previousProject);
      }
      for (const [key, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error(getApiErrorMessage(err) || "Failed to update project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// For timeline drags, where the project is only known at drop time
export function useUpdateProjectById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProjectInput }) => {
      const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_KEY });
      const patch = toProjectPatch(input);
      const previousLists = queryClient.getQueriesData<Project[]>({
        queryKey: PROJECTS_KEY,
        predicate: (query) => isListQueryKey(query.queryKey),
      });
      queryClient.setQueriesData<Project[]>(
        { queryKey: PROJECTS_KEY, predicate: (query) => isListQueryKey(query.queryKey) },
        (old) => old?.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
      return { previousLists };
    },
    onError: (err, _vars, context) => {
      for (const [key, data] of context?.previousLists ?? []) queryClient.setQueryData(key, data);
      toast.error(getApiErrorMessage(err) || "Failed to update project");
    },
    onSettled: () => {
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
