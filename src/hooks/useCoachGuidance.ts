import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoachActivities,
  getCoachCrm,
  getCoachSales,
  getCoachToday,
  saveCoachCatchUp,
  type CoachCatchUpPayload,
  type CoachGuidanceResponse,
} from "@/lib/api";
import { invalidateOperatingSystem } from "@/lib/queryInvalidation";

export function useCoachToday() {
  return useQuery<CoachGuidanceResponse>({
    queryKey: ["coach", "today"],
    queryFn: getCoachToday,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCoachSales() {
  return useQuery<CoachGuidanceResponse>({
    queryKey: ["coach", "sales"],
    queryFn: getCoachSales,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCoachActivities() {
  return useQuery<CoachGuidanceResponse>({
    queryKey: ["coach", "activities"],
    queryFn: getCoachActivities,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCoachCrm() {
  return useQuery<CoachGuidanceResponse>({
    queryKey: ["coach", "crm"],
    queryFn: getCoachCrm,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSaveCoachCatchUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CoachCatchUpPayload) => saveCoachCatchUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      invalidateOperatingSystem(queryClient);
    },
  });
}
