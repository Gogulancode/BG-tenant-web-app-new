import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  getMetrics,
  getMetricLogs,
  createMetric,
  updateMetric,
  deleteMetric,
  logMetric,
} from "@/lib/api";
import { invalidateMetricOperatingData } from "@/lib/queryInvalidation";

export interface Metric {
  id: string;
  name: string;
  target?: number;
  createdAt: string;
}

export interface MetricLog {
  id: string;
  metricId: string;
  value: number;
  date: string;
  loggedAt?: string;
  metric?: {
    id: string;
    name: string;
    target?: number;
  };
}

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await getMetrics();
      // Handle both array and paginated response formats
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export function useMetricLogs(metricId: string) {
  return useQuery({
    queryKey: ["metricLogs", metricId],
    queryFn: () => getMetricLogs(metricId),
    enabled: !!metricId,
    staleTime: 30 * 1000,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; target?: number }) =>
      createMetric(payload),
    onSuccess: () => {
      invalidateMetricOperatingData(queryClient);
      toast({ title: "Metric created", description: "New metric has been added" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create metric",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      metricId,
      payload,
    }: {
      metricId: string;
      payload: { name?: string; target?: number };
    }) => updateMetric(metricId, payload),
    onSuccess: () => {
      invalidateMetricOperatingData(queryClient);
      toast({ title: "Metric updated", description: "Changes have been saved" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update metric",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (metricId: string) => deleteMetric(metricId),
    onSuccess: () => {
      invalidateMetricOperatingData(queryClient);
      toast({ title: "Metric deleted", description: "Metric has been removed" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete metric",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ metricId, value }: { metricId: string; value: number }) =>
      logMetric(metricId, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["metricLogs", variables.metricId] });
      invalidateMetricOperatingData(queryClient);
      toast({ title: "Value logged", description: "Metric value has been recorded" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log value",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
