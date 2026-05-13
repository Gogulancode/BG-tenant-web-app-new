import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardGuidance } from "./api";

describe("getDashboardGuidance", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches tenant coaching guidance from the dashboard guidance endpoint", async () => {
    const guidance = {
      summary: {
        title: "Today's Focus",
        message: "Log one useful follow-up today.",
        tone: "encouraging",
        healthScore: 72,
      },
      cards: [
        {
          id: "sales-gap-followups",
          type: "next_action",
          priority: "high",
          title: "Close the sales gap",
          message: "A focused follow-up today can protect the month.",
          actionLabel: "Log sales",
          actionRoute: "/sales",
          source: "sales",
        },
      ],
      signals: [
        {
          key: "monthly_target_progress",
          label: "Monthly target progress",
          value: 42,
          unit: "percent",
          status: "watch",
        },
      ],
      generatedAt: "2026-05-13T00:00:00.000Z",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: () => Promise.resolve(JSON.stringify(guidance)),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getDashboardGuidance()).resolves.toEqual(guidance);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/dashboard\/guidance$/);
    expect(options).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
