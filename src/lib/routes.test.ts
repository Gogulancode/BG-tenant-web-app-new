import { describe, expect, it } from "vitest";
import { normalizeTenantRoute } from "./routes";

describe("normalizeTenantRoute", () => {
  it("maps backend coach routes to tenant web routes", () => {
    expect(normalizeTenantRoute("/setup")).toBe("/onboarding");
    expect(normalizeTenantRoute("/sales/prospects")).toBe("/sales");
    expect(normalizeTenantRoute("/activities")).toBe("/activities");
  });

  it("uses a safe fallback when guidance does not include a route", () => {
    expect(normalizeTenantRoute(undefined, "/today")).toBe("/today");
  });
});
