# Tenant Module - Comprehensive Testing Checklist

This guide helps you verify all functionalities in the tenant module are working correctly with proper calculations.

**Test Credentials:**
- Email: `admin@example.com`
- Password: `Admin@123`
- Tenant: `seed-tenant`

**URLs:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3002
- Swagger Docs: http://localhost:3002/api/docs

---

## 🔐 1. Authentication Testing

### 1.1 Login Flow
- [ ] Navigate to http://localhost:8080/login
- [ ] Enter valid credentials and click Login
- [ ] Verify redirect to Dashboard
- [ ] Check localStorage for `access_token` and `refresh_token`

### 1.2 Session Persistence
- [ ] Refresh the page after login
- [ ] Verify you remain logged in (token refresh works)

### 1.3 Logout
- [ ] Click Logout in the sidebar
- [ ] Verify redirect to Login page
- [ ] Verify localStorage tokens are cleared

---

## 📊 2. Dashboard Testing

### 2.1 Data Display
- [ ] Navigate to Dashboard
- [ ] Verify Momentum Score card shows a percentage (0-100%)
- [ ] Verify Streak count displays correctly
- [ ] Verify Flag badge shows (Green/Yellow/Red)

### 2.2 Momentum Calculation Verification
**Formula:** `momentumScore = (completedOutcomes / totalOutcomes) * 50 + (activeDays / 7) * 50`

Example:
- 3 of 6 outcomes completed = 25 points
- 5 active days this week = ~35.7 points
- **Total Momentum = 60.7%**

### 2.3 Flag System Verification
| Score Range | Expected Flag |
|-------------|---------------|
| 70-100      | 🟢 Green      |
| 40-69       | 🟡 Yellow     |
| 0-39        | 🔴 Red        |

### 2.4 Sales Progress
- [ ] Verify Weekly Revenue Target displays
- [ ] Verify Achieved This Week displays
- [ ] Verify Progress percentage is correct

---

## 📈 3. Metrics Testing

### 3.1 View Metrics
- [ ] Navigate to Metrics page
- [ ] Verify existing metrics display in table
- [ ] Check each metric shows: Name, Target, Last Recorded, Trend

### 3.2 Add New Metric
- [ ] Click "Add Metric" button
- [ ] Enter Name: "Test Metric"
- [ ] Enter Target: 100
- [ ] Click Save
- [ ] Verify new metric appears in table

### 3.3 Log Metric Value
- [ ] Click the "Log" or dropdown menu on a metric
- [ ] Enter a value (e.g., 85)
- [ ] Click Save
- [ ] Verify "Last Recorded" updates with today's date and value

### 3.4 View Metric Logs
- [ ] Click on a metric to view logs
- [ ] Verify history shows all logged values with dates
- [ ] Verify chart/trend displays correctly

### 3.5 Edit Metric
- [ ] Click Edit on an existing metric
- [ ] Change name or target
- [ ] Verify changes persist

### 3.6 Delete Metric
- [ ] Click Delete on a test metric
- [ ] Confirm deletion
- [ ] Verify metric is removed from list

### 3.7 Trend Indicator Verification
- [ ] Log values over multiple days
- [ ] Verify trend arrow: ↑ (up), ↓ (down), → (flat)

---

## 🎯 4. Outcomes Testing

### 4.1 View Weekly Outcomes
- [ ] Navigate to Outcomes page
- [ ] Verify current week's outcomes display
- [ ] Use week navigation to see previous/next weeks

### 4.2 Add New Outcome
- [ ] Click "Add Outcome"
- [ ] Enter title: "Test Outcome"
- [ ] Select status: "Planned"
- [ ] Click Save
- [ ] Verify outcome appears in list

### 4.3 Update Outcome Status
- [ ] Change an outcome from "Planned" to "In Progress"
- [ ] Change an outcome from "In Progress" to "Done"
- [ ] Verify status badge updates correctly

### 4.4 Mark as Missed
- [ ] Set an outcome status to "Missed"
- [ ] Verify it shows correctly

### 4.5 Delete Outcome
- [ ] Delete a test outcome
- [ ] Verify it's removed from list

### 4.6 Carry-Forward Verification
- [ ] Create an outcome for previous week as "Missed"
- [ ] Navigate to current week
- [ ] Verify system suggests carrying it forward (if implemented)

---

## 💰 5. Sales Testing

### 5.1 Quarterly Planning
- [ ] Navigate to Sales page
- [ ] Click on "Planning" or "Set Goals" section
- [ ] Set Q1 target: 1,000,000
- [ ] Set Q2 target: 1,200,000
- [ ] Set Q3 target: 1,500,000
- [ ] Set Q4 target: 2,000,000
- [ ] Click Save
- [ ] Verify targets persist after page refresh

### 5.2 Annual Target Calculation
**Formula:** `Annual Target = Q1 + Q2 + Q3 + Q4`
- [ ] Verify Annual Target = 5,700,000 (from example above)

### 5.3 Monthly Distribution Calculation
**Formula:** `Monthly Target = Quarterly Target / 3`
- [ ] Q1: Each month should show ~333,333 (1,000,000 / 3)
- [ ] Verify each month shows correct calculated target

### 5.4 Weekly Target Calculation
**Formula:** `Weekly Target = Monthly Target / 4`
- [ ] Verify weekly target displays correctly

### 5.5 Monthly Tracking
- [ ] Select a specific month (e.g., January 2026)
- [ ] Enter Achieved: 500,000
- [ ] Enter Orders: 50
- [ ] Click Save
- [ ] Verify ASP (Average Selling Price) calculates: 500,000 / 50 = 10,000

### 5.6 Progress Percentage
**Formula:** `Progress % = (Achieved / Target) * 100`
- [ ] Verify progress bar and percentage are correct

---

## ✅ 6. Activities Testing

### 6.1 View Activities
- [ ] Navigate to Activities page
- [ ] Verify activities display with: Title, Category, Status, Due Date

### 6.2 Create Activity
- [ ] Click "Add Activity"
- [ ] Enter Title: "Test Task"
- [ ] Select Category: "Marketing"
- [ ] Set Due Date: Tomorrow
- [ ] Set Status: "Active"
- [ ] Click Save
- [ ] Verify activity appears in list

### 6.3 Filter by Category
- [ ] Filter activities by "Marketing"
- [ ] Verify only marketing activities display

### 6.4 Complete Activity
- [ ] Mark an activity as "Completed"
- [ ] Verify status updates

### 6.5 Delete Activity
- [ ] Delete a test activity
- [ ] Verify removal

---

## 📝 7. Reviews Testing

### 7.1 Daily Review
- [ ] Navigate to Reviews page
- [ ] Click "Daily Review" tab
- [ ] Set Mood: 4/5
- [ ] Enter Wins: "Completed project milestone"
- [ ] Enter Challenges: "Time management"
- [ ] Click Submit
- [ ] Refresh page and verify data persists

### 7.2 Weekly Review
- [ ] Click "Weekly Review" tab
- [ ] Set Mood: 4/5
- [ ] Enter Wins for the week
- [ ] Enter Challenges faced
- [ ] Enter Lessons learned
- [ ] Click Submit
- [ ] Verify data saves correctly

---

## 🔍 8. Insights Testing

### 8.1 View Insights
- [ ] Navigate to Insights page
- [ ] Verify Momentum Score displays
- [ ] Verify Flag displays (Green/Yellow/Red)
- [ ] Verify Streak count displays

### 8.2 Recommendations
- [ ] Check recommendations section
- [ ] Verify recommendations are relevant to current flag status:
  - **Green Flag:** "Keep logging daily...", "Plan stretch outcome..."
  - **Yellow Flag:** "Schedule daily review...", "Close planned outcome..."
  - **Red Flag:** "Log metrics for two days...", "Focus on single outcome..."

### 8.3 Trend Verification
- [ ] Check trend direction indicator (↑ up / ↓ down / → flat)
- [ ] Verify trend history shows past weeks

### 8.4 Activity Summary
- [ ] Verify active activities count
- [ ] Verify completed activities count
- [ ] Verify breakdown by category

---

## ⚙️ 9. Settings Testing

### 9.1 Profile Settings
- [ ] Navigate to Settings page
- [ ] Verify Name displays correctly
- [ ] Verify Email displays correctly
- [ ] Update Name
- [ ] Click Save
- [ ] Refresh and verify change persists

### 9.2 Notification Preferences
- [ ] Toggle "Email Notifications" on/off
- [ ] Toggle "Push Notifications" on/off
- [ ] Click Save
- [ ] Refresh and verify settings persist

### 9.3 Timezone
- [ ] Select a different timezone
- [ ] Click Save
- [ ] Verify timezone persists

---

## 📋 10. Templates Testing

### 10.1 Browse Templates
- [ ] Navigate to Templates page
- [ ] Verify Metric Templates display
- [ ] Verify Outcome Templates display
- [ ] Verify Activity Templates display

### 10.2 Apply Template
- [ ] Click "Apply" on a Metric Template
- [ ] Navigate to Metrics page
- [ ] Verify the metric was created from template

---

## 🧪 11. API Verification (Browser DevTools)

Open Browser DevTools → Network tab and verify:

### 11.1 No 404 Errors
- [ ] Navigate through all pages
- [ ] Verify no 404 errors in Network tab

### 11.2 No 500 Errors
- [ ] Perform all CRUD operations
- [ ] Verify no 500 errors

### 11.3 Console Clean
- [ ] Check Console tab
- [ ] Verify no JavaScript errors
- [ ] Verify no React warnings

---

## 📱 12. Responsive Design Testing

### 12.1 Desktop (1920x1080)
- [ ] All pages display correctly
- [ ] Sidebar visible and functional
- [ ] Tables readable

### 12.2 Tablet (768px)
- [ ] Sidebar collapses to hamburger menu
- [ ] Content adapts to width
- [ ] Forms still usable

### 12.3 Mobile (375px)
- [ ] Navigation works via hamburger menu
- [ ] Cards stack vertically
- [ ] Buttons are tappable

---

## 🧮 Calculation Formulas Reference

### Momentum Score
```
momentumScore = (completedOutcomes / totalOutcomes) × 50 + (activeDays / 7) × 50
```

### Flag Thresholds
```
Green:  momentumScore >= 70
Yellow: momentumScore >= 40 AND < 70
Red:    momentumScore < 40
```

### Streak
Consecutive days with activity (outcome completion or metric logging)

### Sales Calculations
```
Annual Target     = Q1 + Q2 + Q3 + Q4
Monthly Target    = Quarterly Target / 3
Weekly Target     = Monthly Target / 4
ASP               = Achieved Revenue / Number of Orders
Progress %        = (Achieved / Target) × 100
Net Profit        = Achieved - Expenses
```

---

## 🐛 Bug Reporting Template

If you find an issue, document it:

```
**Page:** [Page Name]
**Action:** [What you did]
**Expected:** [What should happen]
**Actual:** [What happened]
**Console Error:** [Any error message]
**Screenshot:** [Attach if relevant]
```

---

## ✅ Sign-Off Checklist

| Module         | Tested | Works | Notes |
|----------------|--------|-------|-------|
| Authentication | [ ]    | [ ]   |       |
| Dashboard      | [ ]    | [ ]   |       |
| Metrics        | [ ]    | [ ]   |       |
| Outcomes       | [ ]    | [ ]   |       |
| Sales          | [ ]    | [ ]   |       |
| Activities     | [ ]    | [ ]   |       |
| Reviews        | [ ]    | [ ]   |       |
| Insights       | [ ]    | [ ]   |       |
| Settings       | [ ]    | [ ]   |       |
| Templates      | [ ]    | [ ]   |       |

**Tested By:** _________________  
**Date:** _________________  
**Approved for Production:** [ ] Yes [ ] No
