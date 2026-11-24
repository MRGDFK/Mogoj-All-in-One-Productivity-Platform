import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "@mogoj/shared";
import { api } from "@/lib/api";

export const ME_QUERY_KEY = ["auth", "me"] as const;

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<ApiResponse<AuthUser>>("/auth/login", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<ApiResponse<AuthUser>>("/auth/register", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await api.patch<ApiResponse<AuthUser>>("/auth/profile", input);
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}
