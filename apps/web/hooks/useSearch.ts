import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, SearchResults } from "@mogoj/shared";
import { api } from "@/lib/api";

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SearchResults>>("/search", { params: { q } });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    enabled: q.trim().length > 1,
  });
}
