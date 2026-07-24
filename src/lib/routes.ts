export function normalizeTenantRoute(
  route?: string | null,
  fallback = "/dashboard",
) {
  if (!route) return fallback;
  if (route === "/setup") return "/onboarding";
  if (route === "/sales/prospects") return "/sales";
  return route;
}
