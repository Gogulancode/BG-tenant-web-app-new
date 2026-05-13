import { useQuery } from "@tanstack/react-query";
import {
  getDashboardGuidance,
  type DashboardGuidanceResponse,
} from "@/lib/api";

export function useDashboardGuidance() {
  return useQuery<DashboardGuidanceResponse>({
    queryKey: ["dashboard-guidance"],
    queryFn: getDashboardGuidance,
    staleTime: 60_000,
    retry: 1,
  });
}
