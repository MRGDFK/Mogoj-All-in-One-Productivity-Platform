import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ApiResponse, HQDashboard, DashboardQuery, Throughput, ThroughputRange } from "@mogoj/shared";
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

/**
 * Activity chart data. Kept off the "dashboard" key on purpose: optimistic writers patch every
 * ["dashboard"] query assuming the HQDashboard shape. Task mutations invalidate ["throughput"].
 */
export function useThroughput(range: ThroughputRange) {
  return useQuery({
    queryKey: ["throughput", range],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Throughput>>("/dashboard/throughput", { params: { range } });
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    // Keep the old curve on screen while a new range loads
    placeholderData: keepPreviousData,
  });
}
