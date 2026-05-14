# Coach-Led Post-Onboarding Experience Design

## Purpose

After onboarding, the tenant experience should not feel like a passive dashboard. It should feel like a guided business coach that understands the user's setup, current week, activity rhythm, CRM state, and sales pace.

The homepage/Today page should always answer four questions:

- Where am I now?
- What should I do next?
- Why does this action matter?
- What changed after I acted?

The app should keep the existing brand system, colors, fonts, and general UI language. The change is behavioral and interaction-led: more guided, more appreciative, more animated, and more responsive to the user's real data.

## Core Product Principle

The app is a guided business coach first, dashboard second.

Sales is treated as an outcome. The coach should guide the behaviors that create sales: activity rhythm, follow-ups, pipeline movement, proof actions, and weekly review habits.

## Post-Onboarding Entry Flow

When a user completes onboarding, they land on Today.

If they join mid-week, Today should start with a coach-led catch-up flow instead of a generic dashboard. For example, if the user completes onboarding on Wednesday, the coach should say that the week needs to be made accurate first.

The catch-up flow asks one question at a time:

- Did you close any sales from Monday to today?
- How many orders or deals were closed?
- Which activities were already completed this week?
- Are there warm or hot prospects that need follow-up?
- Any notes that affect this week's plan?

After catch-up, the app calculates current weekly status and generates a short daily plan.

## Weekly Pace Rules

Weekly targets remain fixed. If the user's weekly target is `Rs 2,25,000`, the target stays `Rs 2,25,000` even if they onboard mid-week.

Expected pace uses a Monday-Sunday rhythm.

Example:

- Weekly target: `Rs 2,25,000`
- Daily pace: `Rs 32,143`
- If today is Wednesday, expected progress by end of Wednesday is `Rs 96,429`

Catch-up entries are real operating records. They should be saved into the same sales, activity, and CRM APIs used elsewhere in the product, not stored as temporary onboarding data.

Today should show:

- achieved so far
- expected by today
- remaining this week
- activity progress
- CRM follow-ups due
- momentum or streak status

## Daily Plan

After catch-up, Today should generate a short plan with two required actions and one optional stretch action.

Each action should include:

- title
- reason
- priority
- direct CTA
- completion state
- coach reaction after completion

The daily plan should usually include:

- one revenue or CRM action
- one activity rhythm action
- one review, proof, or stretch action

Example:

```text
Today's plan

1. Follow up with 2 warm prospects
Reason: You are Rs 46,000 behind Wednesday pace.

2. Complete 1 referral request
Reason: Your activity rhythm is 2 actions behind this week.

3. Stretch: Add 1 new prospect
Reason: You have no hot prospects for the rest of the week.
```

## Personalization Inputs

The coach should recommend actions using four layers of data.

### Business Type

The business model changes recommended actions.

Examples:

- consulting/coaching: discovery calls, proposal follow-ups, referral requests, client outcome check-ins
- retail/product: repeat customer offers, order follow-ups, stock or margin review, reorder prompts
- agency: pipeline follow-ups, case study proof, renewal checks, proposal movement
- manufacturing/distribution: quote conversion, distributor follow-up, production or delivery checkpoint

### User Goals

The coach uses onboarding goals:

- annual target
- monthly target
- weekly target
- ASP/ATS
- conversion ratio
- expected leads
- existing vs new customer contribution

These tell the coach whether the gap is revenue, lead volume, conversion, or customer mix.

### Activity Setup

The user's selected activity templates form the base rhythm. User-selected actions should be trusted first.

Examples:

- warm follow-ups
- referral requests
- existing customer check-ins
- LinkedIn proof posts
- discovery calls

### Live Data

Live data determines what needs attention now:

- sales logged this week
- activities completed this week
- CRM follow-ups due or overdue
- prospect status distribution
- weekly outcomes
- momentum and streak state

The recommendation formula is:

```text
Business model + goals + selected activities + live progress = today's recommended actions
```

## User-Selected And Platform-Suggested Actions

The coach uses both user-selected actions and platform-suggested actions.

User-selected actions are the base plan.

Platform suggestions fill gaps when:

- setup is too narrow
- CRM has no prospects
- sales is behind but activity is high
- existing customer contribution is low
- new customer contribution is low
- proof activity is missing
- pipeline has no warm or hot prospects

Rule:

```text
Start with selected activity templates
+ check live gaps
+ add platform suggestions only where needed
= 2-3 recommended actions
```

## Coach States

The backend should select the first matching state in this order.

### SETUP_INCOMPLETE

Required onboarding fields are missing.

Main action: finish setup.

### CATCH_UP_REQUIRED

User completed onboarding mid-week and has not confirmed Monday-to-today operating data for the current week.

Main action: catch up this week.

### INACTIVE

No sales, activities, CRM movement, or outcomes are logged this week.

Main action: start with one business action.

### ACHIEVED

Weekly sales target or activity target is achieved.

Main action: appreciate progress and prepare next week.

### BEHIND

Sales, activity, lead, or prospect pace is below expected Monday-Sunday pace.

Main action: recovery plan.

### ON_TRACK

Actual pace is close to expected pace.

Main action: protect the rhythm.

### AHEAD

Actual pace is above expected pace.

Main action: strengthen future pipeline.

## Daily Action Priority

The coach chooses actions in this priority order:

1. Finish setup if needed
2. Complete catch-up if needed
3. Handle overdue CRM follow-ups
4. Fix activity rhythm gap
5. Fix sales/revenue pace gap
6. Fix lead or prospect volume gap
7. Move warm or hot prospects forward
8. Add proof, review, or report action
9. Maintain streak if on track
10. Build next week pipeline if ahead or achieved

## Tone Rules

The coach should be direct, encouraging, specific, action-first, and never blaming.

Behind:

```text
You're behind pace, but this is recoverable. Start with two warm follow-ups today.
```

On track:

```text
You're on track. Keep the rhythm with one meaningful follow-up and one proof action.
```

Ahead:

```text
You're ahead this week. Good. Use today to build next week's pipeline.
```

Inactive:

```text
Nothing is logged yet this week. Start small: complete one business action and log it.
```

Achieved:

```text
Weekly target achieved. Strong work. Now protect next week by adding one warm prospect.
```

## Coach Placement

### Today

Today is the full coach-led operating room.

It should include:

- weekly status
- catch-up flow when needed
- 2-3 action daily plan
- quick logging
- progress reactions
- achievement appreciation
- animated guidance

### Sales

Sales gets a compact mini coach focused on:

- sales pace
- expected vs achieved
- lead or conversion gap
- suggested revenue action

### Activities

Activities gets a compact mini coach focused on:

- activity rhythm
- completed vs weekly goal
- next recommended activity
- streak encouragement

### CRM

CRM gets a compact mini coach focused on:

- overdue follow-ups
- warm and hot prospects
- stale prospects
- pipeline cleanup

### Reports

Reports gets light guidance:

- business profile readiness
- missing data that would strengthen the report

### Settings/Profile

Settings only guides when useful data is missing:

- business description
- website/social links
- profile fields used in reports

## Shared Backend Coach Engine

Coach logic should be centralized in the tenant backend so web and mobile use the same business brain.

Backend owns:

- current week calculation
- Monday-Sunday pace
- catch-up required/not required
- coach state
- action recommendations
- reasons
- celebration messages
- page-specific mini coach guidance

Frontend owns:

- layout
- animation
- interaction model
- inline forms
- page-specific presentation

Principle:

```text
Backend decides what to say and why.
Frontend decides how beautifully to show it.
```

## Proposed API Shape

```text
GET /api/v1/coach/today
GET /api/v1/coach/sales
GET /api/v1/coach/activities
GET /api/v1/coach/crm
POST /api/v1/coach/catch-up
```

Example guidance response:

```ts
{
  state: "CATCH_UP" | "BEHIND" | "ON_TRACK" | "AHEAD" | "ACHIEVED" | "INACTIVE" | "SETUP_INCOMPLETE",
  message: string,
  stats: {
    weeklyTarget: number,
    achievedSoFar: number,
    expectedByToday: number,
    remaining: number,
    activityDone: number,
    activityGoal: number,
    followupsDue: number
  },
  actions: [
    {
      type: string,
      title: string,
      reason: string,
      priority: "required" | "stretch",
      cta: string,
      route?: string
    }
  ],
  celebration?: {
    type: string,
    message: string
  }
}
```

Example catch-up payload:

```ts
{
  salesRevenue?: number,
  orderCount?: number,
  activitiesCompleted?: Array<{
    title: string,
    category: string,
    occurredOn: string
  }>,
  prospects?: Array<{
    name: string,
    status: "COLD" | "WARM" | "HOT",
    nextAction?: string,
    nextFollowUpDate?: string
  }>,
  notes?: string
}
```

The catch-up endpoint should:

- create or update current week sales entry
- create activity records
- create CRM prospects when provided
- mark catch-up completed for the current week
- return fresh coach guidance

## Interaction Requirements

On Today:

- Show coach-led hero.
- Show action cards, not a passive list.
- Use inline logging where possible.
- Refetch coach guidance after every save.
- Animate progress and completion.
- Show appreciation immediately after meaningful progress.
- Update next action immediately.

On Sales, Activities, and CRM:

- Show compact mini coach.
- Explain the page-specific gap.
- Provide a CTA directly into the relevant action.
- Keep it smaller than Today.

## AI Usage

The initial version should be rule-based.

Rules decide what matters. AI can be added later to improve tone and personalization, but AI should not control business-critical logic.

If AI is unavailable, quota-limited, or disabled, the coach must still work using deterministic templates.

Recommended future hybrid:

```text
Rules choose the action.
AI improves the wording.
Fallback templates always exist.
```

## Success Criteria

- A user completing onboarding mid-week is guided through catch-up before seeing normal Today.
- Today always gives 2 required actions and 1 optional stretch action where possible.
- The coach reacts after actions are saved.
- Web and mobile receive the same coach recommendations from backend.
- The experience feels guided, appreciative, and interactive without changing the app's visual identity.
- Sales remains visible as an outcome, but activity, CRM, and habit rhythm drive the recommendations.

