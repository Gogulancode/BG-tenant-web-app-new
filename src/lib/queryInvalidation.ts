import type { QueryClient } from "@tanstack/react-query";

export function invalidateOperatingSystem(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-guidance"] });
  queryClient.invalidateQueries({ queryKey: ["reports", "business-profile"] });
}

export function invalidateSalesOperatingData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["sales"] });
  invalidateOperatingSystem(queryClient);
}

export function invalidateActivityOperatingData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["activities"] });
  invalidateOperatingSystem(queryClient);
}
