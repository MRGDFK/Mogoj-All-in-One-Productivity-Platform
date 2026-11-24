import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  HQDashboard,
  Task,
  TaskQuery,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  CreateWorkLogInput,
  WorkLog,
} from "@mogoj/shared";
import { api, getApiErrorMessage } from "@/lib/api";
import { isListQueryKey } from "@/lib/queryCache";

const TASKS_KEY = ["tasks"] as const;
const PROJECTS_KEY = ["projects"] as const;
const DASHBOARD_KEY = ["dashboard"] as const;

// Only the fields that are structurally identical between the write DTO and
// the read model are safe to patch optimistically (Date -> ISO string still
// needs converting; relation-id changes and tags are left for the
// post-settle refetch since Task embeds resolved project/area objects and
// full Tag records, not the bare ids/name+color this input carries).
function toTaskPatch(input: UpdateTaskInput): Partial<Task> {
  const patch: Partial<Task> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.projectId !== undefined) patch.projectId = input.projectId;
  if (input.areaId !== undefined) patch.areaId = input.areaId;
  if (input.isRecurring !== undefined) patch.isRecurring = input.isRecurring;
  if (input.order !== undefined) patch.order = input.order;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? input.dueDate.toISOString() : null;
  if (input.startDate !== undefined) patch.startDate = input.startDate ? input.startDate.toISOString() : null;
  return patch;
}

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
    queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    queryClient.invalidateQueries({ queryKey: ["throughput"] });
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

type QueryClient = ReturnType<typeof useQueryClient>;
type PatchContext = Awaited<ReturnType<typeof applyTaskPatch>>;

/** Optimistically applies an update to every cached view of one task; returns what revertTaskPatch needs. */
async function applyTaskPatch(queryClient: QueryClient, id: string, input: UpdateTaskInput) {
  await queryClient.cancelQueries({ queryKey: TASKS_KEY });
  const patch = toTaskPatch(input);

  const previousTask = queryClient.getQueryData<Task>([...TASKS_KEY, id]);
  const previousLists = queryClient.getQueriesData<Task[]>({
    queryKey: TASKS_KEY,
    predicate: (query) => isListQueryKey(query.queryKey),
  });

  if (previousTask) {
    queryClient.setQueryData<Task>([...TASKS_KEY, id], { ...previousTask, ...patch });
  }
  queryClient.setQueriesData<Task[]>(
    { queryKey: TASKS_KEY, predicate: (query) => isListQueryKey(query.queryKey) },
    (old) => old?.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  );

  // HQ embeds tasks too: tick it there instantly, the settle refetch recounts
  await queryClient.cancelQueries({ queryKey: DASHBOARD_KEY });
  const previousDashboards = queryClient.getQueriesData<HQDashboard>({ queryKey: DASHBOARD_KEY });
  const patchTask = (t: Task) => (t.id === id ? { ...t, ...patch } : t);
  queryClient.setQueriesData<HQDashboard>({ queryKey: DASHBOARD_KEY }, (old) =>
    old && { ...old, todayTasks: old.todayTasks.map(patchTask), upcomingTasks: old.upcomingTasks?.map(patchTask) ?? [] },
  );

  return { previousTask, previousLists, previousDashboards };
}

function revertTaskPatch(queryClient: QueryClient, id: string, context: PatchContext | undefined) {
  if (context?.previousTask) {
    queryClient.setQueryData([...TASKS_KEY, id], context.previousTask);
  }
  for (const [key, data] of [...(context?.previousLists ?? []), ...(context?.previousDashboards ?? [])]) {
    queryClient.setQueryData(key, data);
  }
}

async function patchTask(id: string, input: UpdateTaskInput) {
  const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => patchTask(id, input),
    onMutate: (input) => applyTaskPatch(queryClient, id, input),
    onError: (err, _input, context) => {
      revertTaskPatch(queryClient, id, context);
      toast.error(getApiErrorMessage(err) || "Failed to update task");
    },
    onSettled: invalidate,
  });
}

// For calendar/timeline drags, where the task is only known at drop time
export function useUpdateTaskById() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => patchTask(id, input),
    onMutate: ({ id, input }) => applyTaskPatch(queryClient, id, input),
    onError: (err, { id }, context) => {
      revertTaskPatch(queryClient, id, context);
      toast.error(getApiErrorMessage(err) || "Failed to update task");
    },
    onSettled: invalidate,
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

export function useCreateWorkLog(taskId: string) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: async (input: CreateWorkLogInput) => {
      const { data } = await api.post<ApiResponse<WorkLog>>(`/tasks/${taskId}/worklogs`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: invalidate,
  });
}
