import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  Task,
  TaskQuery,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const TASKS_KEY = ["tasks"] as const;
const PROJECTS_KEY = ["projects"] as const;

export function useTasks(query: TaskQuery = {} as TaskQuery) {
  return useQuery({
    queryKey: [...TASKS_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>("/tasks", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
  };
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data } = await api.post<ApiResponse<Task>>("/tasks", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTask(id: string) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: invalidate,
  });
}

// Used by KanbanBoard drag-and-drop, where the moved task's id is only known
// at drop time — unlike useUpdateTask, it isn't bound to one task up front.
export function useMoveTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (vars: { id: string; status: string; order: number }) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${vars.id}`, {
        status: vars.status,
        order: vars.order,
      });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useCreateSubtask(parentTaskId: string) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (input: CreateSubtaskInput) => {
      const { data } = await api.post<ApiResponse<Task>>(
        `/tasks/${parentTaskId}/subtasks`,
        input,
      );
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}
