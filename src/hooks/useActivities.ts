import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createActivity,
  getWeeklyActivitySummary,
  updateActivity,
  type ActivityPayload,
  type WeeklyActivitySummaryResponse,
} from "@/lib/api";

/**
 * Hook to fetch weekly activity summary comparing targets vs actual
 * Returns activity items with target/actual/completionPercent per category
 */
export function useWeeklyActivitySummary(params?: {
  year?: number;
  week?: number;
}) {
  return useQuery<WeeklyActivitySummaryResponse>({
    queryKey: ["activities", "weekly-summary", params?.year, params?.week],
    queryFn: () => getWeeklyActivitySummary(params),
    staleTime: 60_000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ActivityPayload> }) =>
      updateActivity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
