import { useQuery } from "@tanstack/react-query";
import {
  getWeeklyDiagnostics,
  type WeeklyDiagnosticsResponse,
} from "@/lib/api";

/**
 * Hook to fetch weekly diagnostics explaining performance changes
 * Rule-based diagnostic engine (not AI)
 */
export function useWeeklyDiagnostics(params?: {
  year?: number;
  week?: number;
}) {
  return useQuery<WeeklyDiagnosticsResponse>({
    queryKey: ["insights", "weekly-diagnostics", params?.year, params?.week],
    queryFn: () => getWeeklyDiagnostics(params),
    staleTime: 60_000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}
