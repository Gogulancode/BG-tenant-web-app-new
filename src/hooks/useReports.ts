import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { generateReport, getBusinessProfileReport } from "@/lib/api";

export function useBusinessProfileReport() {
  return useQuery({
    queryKey: ["reports", "business-profile"],
    queryFn: getBusinessProfileReport,
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (payload: { type: "weekly" | "monthly"; format?: string }) =>
      generateReport(payload),
    onSuccess: (data) => {
      toast({
        title: "Report generated",
        description: "Your report is ready for download",
      });
      // If the API returns a download URL, trigger download
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
