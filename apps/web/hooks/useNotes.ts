import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  Note,
  NoteQuery,
  CreateNoteInput,
  UpdateNoteInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

const NOTES_KEY = ["notes"] as const;

export function useNotes(query: NoteQuery = {}) {
  return useQuery({
    queryKey: [...NOTES_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Note[]>>("/notes", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: [...NOTES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Note>>(`/notes/${id}`);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data } = await api.post<ApiResponse<Note>>("/notes", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      const { data } = await api.patch<ApiResponse<Note>>(`/notes/${id}`, input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/notes/${id}`);
      if (!data.success) throw new Error(data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useLinkNoteToResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, resourceId }: { noteId: string; resourceId: string }) => {
      const { data } = await api.patch<ApiResponse<Note>>(`/notes/${noteId}`, { resourceId });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}
