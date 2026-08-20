import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, HQDashboard, DashboardQuery } from "@mogoj/shared";
import { api } from "@/lib/api";

export function useDashboard(query: DashboardQuery = {} as DashboardQuery) {
  return useQuery({
    queryKey: ["dashboard", query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<HQDashboard>>("/dashboard", { params: query });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
  });
}
