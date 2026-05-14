import { afterEach, describe, expect, it, vi } from "vitest";
import { getCoachToday, getDashboardGuidance, saveCoachCatchUp } from "./api";

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

  it("fetches shared coach Today guidance from the coach endpoint", async () => {
    const guidance = {
      state: "BEHIND",
      message: "You're behind pace, but this is recoverable.",
      stats: {
        weeklyTarget: 225000,
        achievedSoFar: 50000,
        expectedByToday: 96429,
        remaining: 175000,
        activityDone: 2,
        activityGoal: 7,
        followupsDue: 1,
      },
      actions: [
        {
          type: "COMPLETE_ACTIVITY_RHYTHM",
          title: "Complete one business activity",
          reason: "Activity rhythm is behind.",
          priority: "required",
          cta: "Add activity",
          route: "/activities",
          source: "activity",
        },
      ],
      generatedAt: "2026-05-14T00:00:00.000Z",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: () => Promise.resolve(JSON.stringify(guidance)),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCoachToday()).resolves.toEqual(guidance);

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/coach\/today$/);
  });

  it("posts coach catch-up to the catch-up endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: () =>
        Promise.resolve(
          JSON.stringify({
            state: "BEHIND",
            message: "Catch-up saved.",
            stats: {
              weeklyTarget: 225000,
              achievedSoFar: 50000,
              expectedByToday: 96429,
              remaining: 175000,
              activityDone: 0,
              activityGoal: 7,
              followupsDue: 0,
            },
            actions: [],
            generatedAt: "2026-05-14T00:00:00.000Z",
          }),
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    await saveCoachCatchUp({ salesRevenue: 50000, orderCount: 2 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/coach\/catch-up$/);
    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ salesRevenue: 50000, orderCount: 2 }),
      }),
    );
  });
});
