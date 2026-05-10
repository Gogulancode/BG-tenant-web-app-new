# BG Accountability - Tenant Web and Mobile UAT Guide

Use this document to test the tenant user journey only. Superadmin is not part of this review cycle.

## Review Scope

| Area | Link / Access | Status |
| --- | --- | --- |
| Tenant Web App | https://bridge-gaps-dashboard-main.vercel.app | Ready for tenant UAT |
| Tenant Mobile App | Shared separately as Expo preview/APK | Ready for mobile UAT after preview build is shared |
| Superadmin | Not included in this review | Internal validation only |

## Mobile App Sharing

Recommended for client testing:

1. Android: share an Expo EAS preview APK link.
2. iPhone: share through TestFlight when Apple Developer setup is available.
3. Developer-only fallback: Expo Go QR, useful only when testers are comfortable installing Expo Go and using a development session.

Current mobile project supports Android preview APK using:

```bash
cd D:\BG-mobile-app
npx eas build --platform android --profile preview
```

After the build completes, Expo gives a shareable install URL. Send that URL to Android testers.

For iPhone physical-device testing, the current `preview` profile is configured for iOS simulator. To share with real iPhone users, configure Apple Developer credentials and use TestFlight or an internal iOS build profile.

## Suggested Test Account

Option A: Create a fresh tenant account during testing.

Option B: If a seeded tenant account is provided, use the credentials shared separately by the project team.

Testers should record the email they used:

| Tester Name | Email Used | Device / Browser | Date |
| --- | --- | --- | --- |
|  |  |  |  |

## Sample Business Data

Use this data while testing onboarding and feature flows.

| Field | Sample Value |
| --- | --- |
| Business Name | Bright Growth Consulting |
| Business Type | Consulting / Services |
| Location | Bengaluru |
| Website | https://brightgrowth.example |
| Primary Customer | SME founders and business owners |
| Annual Sales Goal | 2400000 |
| Average Selling Price / Ticket Size | 50000 |
| Conversion Ratio | 20 |
| Expected Leads Per Month | 25 |
| Existing Customer Contribution | 40 |
| New Customer Contribution | 60 |
| Weekly Activity Goal | 12 |

## Test Result Legend

Use these values in the Result column:

| Result | Meaning |
| --- | --- |
| Pass | Feature works as expected |
| Partial | Feature works, but usability/data issue found |
| Fail | Feature is blocked or incorrect |
| NA | Not applicable for this tester |

## Use Case 1 - Register and First Login

Goal: Confirm a tenant can create an account and enter the product flow.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open the Tenant Web App | Login/Register page loads |  |  |
| 2 | Register using a new business email | Account is created successfully |  |  |
| 3 | Log in with the same account | User enters onboarding or Today page |  |  |
| 4 | Refresh the browser | User stays logged in |  |  |
| 5 | Log out and log back in | Session works correctly |  |  |

Mobile check:

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open the mobile app | Login/Register screen loads |  |  |
| 2 | Log in with the same tenant account | User enters the mobile experience |  |  |
| 3 | Close and reopen the app | Session remains valid or asks for login cleanly |  |  |

## Use Case 2 - Complete Tenant Onboarding

Goal: Confirm the guided setup captures business identity, sales plan, activities, and final completion.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Start onboarding | First setup step is visible |  |  |
| 2 | Enter business profile details from sample data | Details save successfully |  |  |
| 3 | Enter customer and business identity details | Product accepts and stores the information |  |  |
| 4 | Enter sales plan values | Annual, monthly, and weekly targets calculate correctly |  |  |
| 5 | Enter activity configuration | Activity rhythm and goals save |  |  |
| 6 | Use default sales cycle or add stages | Stages save and appear in the flow |  |  |
| 7 | Complete onboarding | User is redirected to Today/dashboard experience |  |  |
| 8 | Refresh the page | User is not forced to repeat onboarding |  |  |

Expected sales calculation example:

| Input | Expected |
| --- | --- |
| Annual Sales Goal: 2400000 | Monthly target around 200000 |
| Average Ticket Size: 50000 | Around 48 annual orders needed |
| Conversion Ratio: 20% | Around 240 leads annually |
| Expected Leads Per Month: 25 | Around 5 monthly conversions |
| Existing/New Contribution: 40/60 | Split should show existing and new customer targets |

## Use Case 3 - Today Workspace

Goal: Confirm the daily execution page guides the tenant clearly.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Today page | Momentum, sales gap, activity execution, and follow-up areas load |  |  |
| 2 | Save weekly sales from Today | Sales value is saved and reflected in progress |  |  |
| 3 | Complete a suggested activity | Activity is marked/logged successfully |  |  |
| 4 | Open CRM follow-up prompt | User can navigate to Sales CRM |  |  |
| 5 | Test on mobile screen size | Cards are readable and actions are easy to tap |  |  |

Sample weekly sales entry:

| Field | Value |
| --- | --- |
| Sales Revenue | 125000 |
| Orders / Deals | 3 |
| Notes | Closed one retained customer and two new discovery deals |

## Use Case 4 - Sales Planning and Weekly Sales

Goal: Confirm sales targets, weekly logs, and progress tracking work.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Sales page | Sales CRM and revenue operations page loads |  |  |
| 2 | Review calculated targets | Monthly/weekly targets match onboarding plan |  |  |
| 3 | Add or update weekly sales | Entry saves without duplicate/confusing state |  |  |
| 4 | Change week selector | Correct week data loads |  |  |
| 5 | Review trend chart | Weekly progress is visible |  |  |

## Use Case 5 - CRM / Prospect Pipeline

Goal: Confirm tenant can manage prospects and follow-ups.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Sales > CRM Pipeline | Prospect list loads |  |  |
| 2 | Add prospect: Sarah Chen, Warm, value 150000 | Prospect is saved |  |  |
| 3 | Add prospect: Mike Rao, Hot, value 250000 | Prospect is saved |  |  |
| 4 | Update Sarah Chen to Hot | Status updates correctly |  |  |
| 5 | Add next follow-up date | Follow-up appears in Today/CRM context |  |  |
| 6 | Mark one prospect Converted | Pipeline summary updates |  |  |

Sample prospects:

| Name | Company | Status | Value | Next Action |
| --- | --- | --- | --- | --- |
| Sarah Chen | Northstar Retail | Warm | 150000 | Send proposal |
| Mike Rao | Atlas Manufacturing | Hot | 250000 | Pricing call |
| Priya Menon | Greenline Foods | Cold | 75000 | Discovery email |

## Use Case 6 - Activity Entry and Execution Rhythm

Goal: Confirm daily/weekly activity tracking works.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Activities page | Activity log loads |  |  |
| 2 | Add activity: Follow-up call | Activity saves |  |  |
| 3 | Add activity: Referral request | Activity saves |  |  |
| 4 | Filter/search activities | Correct activities appear |  |  |
| 5 | Mark an activity complete | Status updates and remains after refresh |  |  |
| 6 | Check Today page | Activity progress reflects recent activity |  |  |

Sample activities:

| Activity | Category | Priority | Notes |
| --- | --- | --- | --- |
| Follow up with Sarah Chen | Sales | High | Proposal follow-up |
| Send referral request to Mike | Referral | Medium | Ask for one intro |
| Update LinkedIn case study | Marketing | Low | Publish weekly proof |

## Use Case 7 - Reports / One-Page Business Profile

Goal: Confirm a tenant can review a polished business profile output.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Reports page | Business profile report loads |  |  |
| 2 | Review business identity section | Uses onboarding/profile data |  |  |
| 3 | Review sales plan section | Shows target, ASP, leads, conversion, customer split |  |  |
| 4 | Review activity setup section | Shows activity rhythm and enabled activities |  |  |
| 5 | Review CRM summary | Shows prospects/pipeline if entered |  |  |
| 6 | Test print/export if available | Output is readable and shareable |  |  |

## Use Case 8 - Profile and Settings

Goal: Confirm basic account and business settings work.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open Settings/Profile | Profile details load |  |  |
| 2 | Update display name | Change saves |  |  |
| 3 | Add social/website details | Change saves |  |  |
| 4 | Refresh page | Saved values remain |  |  |
| 5 | Log out | User returns to login |  |  |

## Mobile-Specific Checks

Goal: Confirm the app feels usable on a real phone.

| Step | Action | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Install mobile app from shared link | App installs successfully |  |  |
| 2 | Login/register | Auth flow works |  |  |
| 3 | Navigate Today, Setup, Sales, Activity, Profile | Bottom navigation and screens work |  |  |
| 4 | Enter sales amount using keyboard | Keyboard does not hide the submit button |  |  |
| 5 | Add activity | Form is touch-friendly and saves |  |  |
| 6 | Rotate/lock portrait as expected | Layout remains stable |  |  |
| 7 | Close and reopen app | Session handling is acceptable |  |  |

## Feedback Summary

| Area | What Worked Well | What Needs Improvement | Priority |
| --- | --- | --- | --- |
| Onboarding |  |  |  |
| Today Workspace |  |  |  |
| Sales |  |  |  |
| CRM |  |  |  |
| Activities |  |  |  |
| Reports |  |  |  |
| Mobile App |  |  |  |

## Final UAT Decision

| Decision | Select One |
| --- | --- |
| Ready for staging sign-off |  |
| Ready with minor fixes |  |
| Needs another review cycle |  |

Reviewer name:

Date:

