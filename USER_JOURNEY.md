# Complete Platform User Journey

This document explains how Superadmin and Tenant apps work together, and the complete user journey in the Tenant platform.

---

## 🏗️ Platform Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           BG ACCOUNTABILITY PLATFORM                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────┐         ┌─────────────────────────┐           │
│   │     SUPERADMIN APP      │         │       TENANT APP        │           │
│   │   (Platform Owner)      │         │    (Business User)      │           │
│   │   Port: 3001            │         │   Port: 8080            │           │
│   │                         │         │                         │           │
│   │ • Create Tenants        │────────▶│ • Register/Login        │           │
│   │ • Manage Subscriptions  │         │ • Onboarding (8 steps)  │           │
│   │ • Create Templates      │────────▶│ • Daily Operations      │           │
│   │ • View All Analytics    │         │ • Track Progress        │           │
│   │ • Support Tickets       │◀────────│ • Submit Support        │           │
│   └─────────────────────────┘         └─────────────────────────┘           │
│                 │                                   │                        │
│                 └──────────────┬────────────────────┘                        │
│                                │                                             │
│                                ▼                                             │
│                    ┌─────────────────────────┐                              │
│                    │      BACKEND API        │                              │
│                    │      Port: 3002         │                              │
│                    │                         │                              │
│                    │  • Auth (JWT/Refresh)   │                              │
│                    │  • Multi-tenant Data    │                              │
│                    │  • Calculations         │                              │
│                    │  • Insights Engine      │                              │
│                    └─────────────────────────┘                              │
│                                │                                             │
│                                ▼                                             │
│                    ┌─────────────────────────┐                              │
│                    │      PostgreSQL         │                              │
│                    │      Database           │                              │
│                    └─────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 👤 Superadmin vs Tenant User

| Aspect | Superadmin | Tenant User |
|--------|------------|-------------|
| **Who** | Platform owner/operator | Business owner/team member |
| **App** | superadmin-app (Port 3001) | bridge-gaps-dashboard (Port 8080) |
| **Purpose** | Manage the entire platform | Run their business accountability |
| **Can See** | All tenants, all data | Only their tenant's data |
| **Creates** | Templates, Tenants | Metrics, Outcomes, Activities |

---

## 🚀 Complete Tenant User Journey

### Phase 1: Onboarding (First-time Setup)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING FLOW (8 STEPS)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Profile Setup          Step 2: Business Identity                   │
│  ┌──────────────────────┐      ┌──────────────────────┐                    │
│  │ • Name               │──────▶│ • Business Type      │                    │
│  │ • Email              │      │   (Solopreneur,      │                    │
│  │ • Avatar             │      │    Startup, MSME)    │                    │
│  └──────────────────────┘      │ • Industry           │                    │
│                                └──────────────────────┘                    │
│                                          │                                  │
│  Step 3: Sales Plan                      ▼                                  │
│  ┌──────────────────────┐      Step 4: Activity Setup                      │
│  │ • Annual Target      │      ┌──────────────────────┐                    │
│  │ • Q1, Q2, Q3, Q4     │──────▶│ • Categories         │                    │
│  │ • Monthly Breakdown  │      │ • Priority Tasks     │                    │
│  └──────────────────────┘      └──────────────────────┘                    │
│                                          │                                  │
│  Step 5: Sales Cycle                     ▼                                  │
│  ┌──────────────────────┐      Step 6: Achievement Stages                  │
│  │ • Deal Stages        │      ┌──────────────────────┐                    │
│  │ • Pipeline Config    │──────▶│ • Milestone Markers  │                    │
│  └──────────────────────┘      │ • Success Criteria   │                    │
│                                └──────────────────────┘                    │
│                                          │                                  │
│  Step 7: Subscription                    ▼                                  │
│  ┌──────────────────────┐      Step 8: Complete! 🎉                        │
│  │ • Plan Selection     │      ┌──────────────────────┐                    │
│  │ • Payment (if any)   │──────▶│ • Welcome Tour       │                    │
│  └──────────────────────┘      │ • Go to Dashboard    │                    │
│                                └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Daily Operations (After Onboarding)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAIN APPLICATION SIDEBAR                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📂 EXECUTION                                                                │
│  ├── Activities     → Task management by category (Marketing, Sales, etc.)  │
│  ├── Outcomes       → Weekly goals (3-5 per week, mark Done/Missed)         │
│  └── Sales          → Track monthly revenue vs targets                      │
│                                                                              │
│  📊 PERFORMANCE                                                              │
│  ├── Dashboard      → KPI overview (Momentum, Streak, Sales Progress)       │
│  ├── Insights       → AI-driven recommendations, flags, trends              │
│  └── Reviews        → Daily/Weekly reflection journals                      │
│                                                                              │
│  ⚙️ SETUP                                                                    │
│  ├── Metrics        → Track key numbers daily (calls, revenue, leads)       │
│  └── Templates      → Browse & apply pre-built templates from Superadmin    │
│                                                                              │
│  🔧 MANAGEMENT                                                               │
│  ├── Reports        → Export & analyze historical data                      │
│  ├── Users          → Team management (invite, roles)                       │
│  ├── Support        → Submit tickets to platform support                    │
│  └── Settings       → Profile, notifications, timezone                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📆 Weekly Rhythm (Recommended Workflow)

### Monday: Plan
```
┌──────────────────────────────────────────┐
│ 1. Go to OUTCOMES                        │
│ 2. Add 3-5 outcomes for the week         │
│ 3. Review weekly sales target            │
└──────────────────────────────────────────┘
```

### Daily: Execute & Track
```
┌──────────────────────────────────────────┐
│ 1. Log METRICS (calls made, leads, etc.) │
│ 2. Update ACTIVITIES status              │
│ 3. Mark OUTCOMES progress                │
│ 4. Log SALES if closed any deals         │
│ 5. Submit DAILY REVIEW (optional)        │
└──────────────────────────────────────────┘
```

### Friday: Review
```
┌──────────────────────────────────────────┐
│ 1. Check INSIGHTS for momentum score     │
│ 2. Review DASHBOARD KPIs                 │
│ 3. Submit WEEKLY REVIEW                  │
│ 4. Mark missed outcomes as "Missed"      │
└──────────────────────────────────────────┘
```

---

## 🧮 How Calculations Work

### Momentum Score (0-100%)
```
Formula: (Completed Outcomes / Total Outcomes) × 50 
       + (Active Days / 7) × 50

Example:
  • 3 of 5 outcomes done = 30 points
  • 5 days logged metrics = 35.7 points
  • TOTAL = 65.7%
```

### Flag System
```
🟢 Green (70-100%): "You're crushing it! Keep going."
🟡 Yellow (40-69%): "Room for improvement. Focus more."
🔴 Red (0-39%):     "Needs attention. Take action today."
```

### Streak
```
Consecutive days with ANY activity:
• Logging a metric
• Completing an outcome
• Submitting a review

Example: Log metrics Mon-Thu = 4-day streak
         Skip Friday = Streak resets to 0
```

---

## 🔗 How Templates Flow (Superadmin → Tenant)

```
┌─────────────────────┐
│     SUPERADMIN      │
│  Creates Templates  │
└──────────┬──────────┘
           │
           │ Creates metric templates like:
           │ • "Daily Sales Calls" (target: 20)
           │ • "Weekly Revenue" (target: 100000)
           │ • "Customer NPS Score" (target: 8)
           │
           ▼
┌─────────────────────┐
│   Backend (API)     │
│  Stores Templates   │
│  tenantId: null     │  ← Global templates
└──────────┬──────────┘
           │
           │ Tenant fetches templates
           │
           ▼
┌─────────────────────┐
│    TENANT APP       │
│   Templates Page    │
│   (Read-Only)       │
├─────────────────────┤
│ [Browse Templates]  │
│                     │
│ Daily Sales Calls   │
│   Target: 20        │
│   [APPLY]           │  ← Click to use
│                     │
│ Weekly Revenue      │
│   Target: ₹1,00,000 │
│   [APPLY]           │
└──────────┬──────────┘
           │
           │ "Apply" creates a new metric
           │ for this tenant user
           │
           ▼
┌─────────────────────┐
│   METRICS PAGE      │
│  (Tenant's Own)     │
├─────────────────────┤
│ Daily Sales Calls   │  ← Now owned by tenant
│ Weekly Revenue      │
│ [LOG] [EDIT] [DEL]  │
└─────────────────────┘
```

---

## 🖥️ Running All Apps

### Terminal 1: Backend API
```powershell
cd d:\BGAccountabiityapp
npm run start:dev
# Runs on http://localhost:3002
```

### Terminal 2: Tenant App
```powershell
cd d:\bridge-gaps-dashboard-main
npm run dev
# Runs on http://localhost:8080
```

### Terminal 3: Superadmin App (if needed)
```powershell
cd d:\superadmin-app
npm run dev
# Runs on http://localhost:3001
```

---

## 🔐 Test Accounts

### Tenant App (Regular User)
```
URL: http://localhost:8080
Email: admin@example.com
Password: Admin@123
```

### Superadmin App (Platform Admin)
```
URL: http://localhost:3001
Email: superadmin@example.com
Password: SuperAdmin@123
```

---

## 📍 Current Status

| Component | Port | Status | URL |
|-----------|------|--------|-----|
| Backend API | 3002 | ✅ Running | http://localhost:3002 |
| Tenant App | 8080 | ⚠️ Check | http://localhost:8080 |
| Superadmin App | 3001 | ⚠️ Check | http://localhost:3001 |

---

## 🗺️ User Journey Visual Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    [REGISTER] ─────▶ [ONBOARDING] ─────▶ [DASHBOARD] ◀─────────────────┐    │
│                      (8 steps)           ↓                              │    │
│                                    ┌─────┴─────┐                        │    │
│                                    ▼           ▼                        │    │
│                              [METRICS]    [OUTCOMES]                    │    │
│                              Log daily    Plan weekly                   │    │
│                                    │           │                        │    │
│                                    └─────┬─────┘                        │    │
│                                          ▼                              │    │
│                                    [INSIGHTS]                           │    │
│                                    AI analyzes                          │    │
│                                          │                              │    │
│                                          ▼                              │    │
│                                    ┌─────────────┐                      │    │
│                                    │  MOMENTUM   │                      │    │
│                                    │  SCORE      │──────────────────────┘    │
│                                    │  FLAG       │                           │
│                                    │  STREAK     │                           │
│                                    └─────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ❓ Still Confused?

1. **Not seeing Superadmin?** → It needs to be started separately: `cd d:\superadmin-app && npm run dev`

2. **Where's my onboarding data?** → After onboarding, data flows to:
   - Sales Plan → Sales page (quarterly targets)
   - Business Type → Used for NSM suggestions
   - Profile → Settings page

3. **Templates not showing?** → Superadmin needs to create them first via the Superadmin app

4. **Momentum stuck at 0?** → You need to:
   - Create outcomes and mark them "Done"
   - Log metrics daily
   - Both contribute 50% each to the score

5. **How do pages connect?**
   - Onboarding → Sets up initial Sales targets
   - Sales page → Shows/edits the targets
   - Dashboard → Summarizes everything
   - Insights → Calculates momentum from all activities
