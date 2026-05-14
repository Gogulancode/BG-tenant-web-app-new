# Coach-Led Today Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production slice of the coach-led post-onboarding experience: a shared backend coach API and a tenant web Today page that uses it for catch-up, pace, daily plan, and appreciation.

**Architecture:** Add a backend `CoachModule` that wraps deterministic coaching rules in one shared contract. Tenant web consumes the coach API through a new hook and renders a coach-led Today hero/action plan while preserving the existing UI system, colors, fonts, and page structure. Mobile will consume the same API in the next slice.

**Tech Stack:** NestJS, Prisma, Jest, React, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Vitest.

---

## File Structure

### Backend: `D:\BGAccountabiityapp`

- Create `src/coach/dto/coach.dto.ts`
  - Defines response DTOs, action states, coach states, and catch-up payload DTOs.
- Create `src/coach/coach.service.ts`
  - Owns Monday-Sunday pace, catch-up requirement, coach state selection, action ranking, and catch-up persistence.
- Create `src/coach/coach.controller.ts`
  - Exposes `GET /api/v1/coach/today`, `GET /api/v1/coach/sales`, `GET /api/v1/coach/activities`, `GET /api/v1/coach/crm`, and `POST /api/v1/coach/catch-up`.
- Create `src/coach/coach.module.ts`
  - Registers controller/service and imports `PrismaModule`.
- Modify `src/app.module.ts`
  - Adds `CoachModule`.
- Create `src/coach/coach.service.spec.ts`
  - Unit tests for state priority, Monday-Sunday pace, catch-up persistence, and action recommendations.

### Tenant Web: `D:\bridge-gaps-dashboard-main`

- Modify `src/lib/api.ts`
  - Adds `CoachGuidanceResponse`, `CoachCatchUpPayload`, `getCoachToday`, `getCoachSales`, `getCoachActivities`, `getCoachCrm`, `saveCoachCatchUp`.
- Modify `src/lib/api.test.ts`
  - Verifies coach API paths.
- Create `src/hooks/useCoachGuidance.ts`
  - Query/mutation hooks for shared coach guidance.
- Modify `src/lib/queryInvalidation.ts`
  - Invalidates `["coach", ...]` alongside dashboard/report data.
- Create `src/components/coach/CoachDailyPlan.tsx`
  - Renders 2 required actions + 1 stretch action as interactive action cards.
- Create `src/components/coach/CoachCatchUpCard.tsx`
  - Renders coach-led catch-up inputs for sales, orders, activities, prospects, and notes.
- Modify `src/pages/Today.tsx`
  - Uses `useCoachToday`, renders coach-led state above existing stats, posts catch-up, and refetches coach/dashboard data after actions.

---

## Task 1: Backend Coach Contract

**Files:**
- Create: `D:\BGAccountabiityapp\src\coach\dto\coach.dto.ts`
- Create: `D:\BGAccountabiityapp\src\coach\coach.module.ts`
- Create: `D:\BGAccountabiityapp\src\coach\coach.controller.ts`
- Modify: `D:\BGAccountabiityapp\src\app.module.ts`
- Test: `D:\BGAccountabiityapp\src\coach\coach.service.spec.ts`

- [ ] **Step 1: Write DTO and controller tests first**

Create tests that assert:

```ts
expect(result.state).toBe("CATCH_UP_REQUIRED");
expect(result.stats.expectedByToday).toBe(96429);
expect(result.actions).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      priority: "required",
      type: "COMPLETE_CATCH_UP",
    }),
  ]),
);
```

- [ ] **Step 2: Add coach DTOs**

Define these exported types/classes:

```ts
export enum CoachState {
  SETUP_INCOMPLETE = "SETUP_INCOMPLETE",
  CATCH_UP_REQUIRED = "CATCH_UP_REQUIRED",
  INACTIVE = "INACTIVE",
  ACHIEVED = "ACHIEVED",
  BEHIND = "BEHIND",
  ON_TRACK = "ON_TRACK",
  AHEAD = "AHEAD",
}

export enum CoachActionPriority {
  REQUIRED = "required",
  STRETCH = "stretch",
}

export class CoachActionDto {
  type: string;
  title: string;
  reason: string;
  priority: CoachActionPriority;
  cta: string;
  route?: string;
  source: "setup" | "catch_up" | "sales" | "crm" | "activity" | "profile";
}

export class CoachGuidanceResponseDto {
  state: CoachState;
  message: string;
  stats: {
    weeklyTarget: number;
    achievedSoFar: number;
    expectedByToday: number;
    remaining: number;
    activityDone: number;
    activityGoal: number;
    followupsDue: number;
  };
  actions: CoachActionDto[];
  celebration?: { type: string; message: string };
  generatedAt: Date;
}
```

- [ ] **Step 3: Add controller routes**

Use the same guards and role pattern as `DashboardController`.

```ts
@Controller("coach")
export class CoachController {
  @Get("today")
  getToday(@CurrentUser() user: UserContext) {
    return this.coachService.getToday(user.userId, user.tenantId);
  }
}
```

- [ ] **Step 4: Register module**

Import `CoachModule` in `AppModule`.

- [ ] **Step 5: Run the focused test**

Run:

```powershell
npm test -- --runInBand src/coach/coach.service.spec.ts
```

Expected before implementation: failing tests because `CoachService` does not exist.

---

## Task 2: Backend Coach Rules And Catch-Up Persistence

**Files:**
- Create: `D:\BGAccountabiityapp\src\coach\coach.service.ts`
- Modify: `D:\BGAccountabiityapp\src\coach\dto\coach.dto.ts`
- Test: `D:\BGAccountabiityapp\src\coach\coach.service.spec.ts`

- [ ] **Step 1: Implement Monday-Sunday helpers**

Use Monday as week start and Sunday as week end. Expected pace is:

```ts
const expectedByToday = weeklyTarget * (daysElapsedIncludingToday / 7);
```

Round currency stats with `Math.round`.

- [ ] **Step 2: Load coach inputs in one service method**

Load:

- onboarding progress
- sales plan
- weekly sales entry for current week
- activity configuration
- current-week activities
- warm/hot CRM prospects

- [ ] **Step 3: Determine state priority**

Apply the approved state order:

```text
SETUP_INCOMPLETE
CATCH_UP_REQUIRED
INACTIVE
ACHIEVED
BEHIND
ON_TRACK
AHEAD
```

For this first slice, define `CATCH_UP_REQUIRED` when onboarding completed after the current Monday and no current-week sales/activity/prospect data exists yet.

- [ ] **Step 4: Generate 2 required actions and 1 stretch action**

Required action priority:

1. complete setup
2. complete catch-up
3. CRM follow-up
4. activity rhythm
5. sales pace
6. prospect volume

Always return at most three actions.

- [ ] **Step 5: Implement catch-up persistence**

`POST /api/v1/coach/catch-up` should:

- upsert current-week `WeeklySalesEntry` if `salesRevenue` or `orderCount` is provided
- create completed `Activity` rows for `activitiesCompleted`
- create `SalesProspect` rows for `prospects`
- return fresh `getToday`

Use existing tables only for the first slice. A dedicated catch-up marker can be added later if users need to explicitly say "nothing happened this week."

- [ ] **Step 6: Verify backend**

Run:

```powershell
npm run build
npm test -- --runInBand src/coach/coach.service.spec.ts
```

Expected: both pass.

---

## Task 3: Tenant Web Coach API Hook

**Files:**
- Modify: `D:\bridge-gaps-dashboard-main\src\lib\api.ts`
- Modify: `D:\bridge-gaps-dashboard-main\src\lib\api.test.ts`
- Create: `D:\bridge-gaps-dashboard-main\src\hooks\useCoachGuidance.ts`
- Modify: `D:\bridge-gaps-dashboard-main\src\lib\queryInvalidation.ts`

- [ ] **Step 1: Add API tests**

Add tests that assert:

```ts
await getCoachToday();
expect(String(url)).toMatch(/\/api\/v1\/coach\/today$/);
```

and:

```ts
await saveCoachCatchUp({ salesRevenue: 50000, orderCount: 2 });
expect(options.method).toBe("POST");
expect(String(url)).toMatch(/\/api\/v1\/coach\/catch-up$/);
```

- [ ] **Step 2: Add API functions and types**

Add `CoachGuidanceResponse`, `CoachAction`, `CoachCatchUpPayload`, `getCoachToday`, and `saveCoachCatchUp`.

- [ ] **Step 3: Add hooks**

`useCoachToday()` should query `["coach", "today"]`.

`useSaveCoachCatchUp()` should post catch-up and invalidate:

- `["coach", "today"]`
- `["dashboard-summary"]`
- `["dashboard-guidance"]`
- sales/activity/report queries through `invalidateOperatingSystem`

- [ ] **Step 4: Verify frontend API tests**

Run:

```powershell
npm test -- src/lib/api.test.ts
```

Expected: pass.

---

## Task 4: Tenant Web Today Coach UI

**Files:**
- Create: `D:\bridge-gaps-dashboard-main\src\components\coach\CoachDailyPlan.tsx`
- Create: `D:\bridge-gaps-dashboard-main\src\components\coach\CoachCatchUpCard.tsx`
- Modify: `D:\bridge-gaps-dashboard-main\src\pages\Today.tsx`

- [ ] **Step 1: Create `CoachDailyPlan`**

Render each action as a card with:

- title
- reason
- priority badge
- CTA button
- route link when `route` exists

- [ ] **Step 2: Create `CoachCatchUpCard`**

Render the first catch-up form with:

- sales revenue
- order count
- activity count
- notes
- save button

For first slice, activity count creates generic completed activities titled `Catch-up activity`.

- [ ] **Step 3: Wire Today**

Use `useCoachToday()` in `Today.tsx`.

Replace the current static hero logic with coach guidance when available:

- state controls title/message
- `stats` controls metric panel
- `actions` controls daily plan
- `CATCH_UP_REQUIRED` shows catch-up card above the daily plan

Keep existing dashboard cards below this new coach section.

- [ ] **Step 4: Verify frontend**

Run:

```powershell
npm run build
npm test
```

Expected: both pass.

---

## Task 5: Deploy And Commit

**Files:**
- Backend and tenant web changed files from Tasks 1-4.

- [ ] **Step 1: Run final verification**

Backend:

```powershell
npm run build
npm test -- --runInBand src/coach/coach.service.spec.ts
```

Tenant web:

```powershell
npm run build
npm test
```

- [ ] **Step 2: Commit backend**

```powershell
git add src/coach src/app.module.ts
git commit -m "feat: add tenant coach guidance api"
```

- [ ] **Step 3: Commit tenant web**

```powershell
git add src/lib/api.ts src/lib/api.test.ts src/hooks/useCoachGuidance.ts src/lib/queryInvalidation.ts src/components/coach src/pages/Today.tsx docs/superpowers/plans/2026-05-14-coach-led-today-slice.md
git commit -m "feat: add coach-led today experience"
```

- [ ] **Step 4: Deploy**

Backend:

```powershell
npx @railway/cli up --detach
```

Tenant web:

```powershell
vercel deploy --prod --yes
```

- [ ] **Step 5: Push**

Push both repos:

```powershell
git push origin main
```

