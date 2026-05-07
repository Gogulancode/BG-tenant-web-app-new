import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSalesProspect,
  deleteSalesProspect,
  getSalesProspectSummary,
  getSalesProspects,
  getSalesTargets,
  getMonthlyTargets,
  getWeeklyTargets,
  getSalesSummary,
  getSalesWeeklySummary,
  updateSalesProspect,
  type SalesProspectListParams,
  type SalesProspectListResponse,
  type SalesProspectPayload,
  type SalesProspectSummary,
  type SalesTargetsResponse,
  type MonthlyTargetItem,
  type WeeklyTargetItem,
  type SalesSummaryResponse,
  type WeeklySalesSummaryResponse,
} from "@/lib/api";

/**
 * Hook to fetch current period sales targets with achievement data
 */
export function useSalesTargets() {
  return useQuery<SalesTargetsResponse>({
    queryKey: ["sales", "targets"],
    queryFn: getSalesTargets,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch all monthly targets for the year
 */
export function useMonthlyTargets() {
  return useQuery<MonthlyTargetItem[]>({
    queryKey: ["sales", "targets", "monthly"],
    queryFn: getMonthlyTargets,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Hook to fetch all 52 weekly targets for the year
 */
export function useWeeklyTargets() {
  return useQuery<WeeklyTargetItem[]>({
    queryKey: ["sales", "targets", "weekly"],
    queryFn: getWeeklyTargets,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Hook to fetch sales summary with targets
 */
export function useSalesSummary() {
  return useQuery<SalesSummaryResponse>({
    queryKey: ["sales", "summary"],
    queryFn: getSalesSummary,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch weekly sales summary trend
 * Returns weekly targets vs achieved for a range of weeks
 */
export function useSalesWeeklySummary(params?: {
  year?: number;
  fromWeek?: number;
  toWeek?: number;
}) {
  return useQuery<WeeklySalesSummaryResponse>({
    queryKey: ["sales", "weekly-summary", params?.year, params?.fromWeek, params?.toWeek],
    queryFn: () => getSalesWeeklySummary(params),
    staleTime: 60_000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useSalesProspects(params: SalesProspectListParams) {
  return useQuery<SalesProspectListResponse>({
    queryKey: ["sales", "prospects", params],
    queryFn: () => getSalesProspects(params),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesProspectSummary(month?: string) {
  return useQuery<SalesProspectSummary>({
    queryKey: ["sales", "prospects", "summary", month],
    queryFn: () => getSalesProspectSummary(month),
    staleTime: 60_000,
  });
}

function invalidateSalesProspectDependencies(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["sales", "prospects"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  queryClient.invalidateQueries({ queryKey: ["reports", "business-profile"] });
}

export function useCreateSalesProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalesProspect,
    onSuccess: () => {
      invalidateSalesProspectDependencies(queryClient);
    },
  });
}

export function useUpdateSalesProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SalesProspectPayload> }) =>
      updateSalesProspect(id, payload),
    onSuccess: () => {
      invalidateSalesProspectDependencies(queryClient);
    },
  });
}

export function useDeleteSalesProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSalesProspect,
    onSuccess: () => {
      invalidateSalesProspectDependencies(queryClient);
    },
  });
}
