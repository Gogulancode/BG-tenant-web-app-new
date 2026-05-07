import { useQuery } from "@tanstack/react-query";
import {
  getWeeklyOutcomesSummary,
  type WeeklyOutcomesSummaryResponse,
} from "@/lib/api";

/**
 * Hook to fetch weekly outcomes summary comparing planned vs completed
 * Returns year, week, planned, completed, completionPercent
 */
export function useWeeklyOutcomesSummary(params?: {
  year?: number;
  week?: number;
}) {
  return useQuery<WeeklyOutcomesSummaryResponse>({
    queryKey: ["outcomes", "weekly-summary", params?.year, params?.week],
    queryFn: () => getWeeklyOutcomesSummary(params),
    staleTime: 60_000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}
