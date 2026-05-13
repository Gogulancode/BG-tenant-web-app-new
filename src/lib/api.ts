import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  hasAccessToken,
  normalizeAuthTokens,
  redirectToLogin,
  saveAuthTokens,
} from "./auth-session";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const API_URL = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");

let isRefreshing = false;
let refreshWaiters: Array<() => void> = [];

function notifyRefreshDone() {
  refreshWaiters.forEach((fn) => fn());
  refreshWaiters = [];
}

export async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  // prevent multiple parallel refresh calls
  if (isRefreshing) {
    await new Promise<void>((resolve) => refreshWaiters.push(resolve));
    return hasAccessToken();
  }

  try {
    isRefreshing = true;

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      clearAuthSession();
      redirectToLogin();
      return false;
    }

    const data = await res.json();
    const tokens = normalizeAuthTokens(data);
    if (!tokens.accessToken || !tokens.refreshToken) {
      clearAuthSession();
      redirectToLogin();
      return false;
    }

    saveAuthTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch (e) {
    console.error("Token refresh failed", e);
    clearAuthSession();
    redirectToLogin();
    return false;
  } finally {
    isRefreshing = false;
    notifyRefreshDone();
  }
}

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const initialResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (initialResponse.status !== 401) {
    // Handle empty responses or non-JSON responses
    const contentType = initialResponse.headers.get("content-type");
    const text = await initialResponse.text();
    
    if (!initialResponse.ok) {
      // Try to parse error message from response
      let errorMessage = `Request failed with status ${initialResponse.status}`;
      if (text) {
        try {
          const errorJson = JSON.parse(text);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }
    
    // Return parsed JSON or null for empty responses
    if (!text || text.trim() === "") {
      return null;
    }
    
    if (contentType?.includes("application/json")) {
      return JSON.parse(text);
    }
    
    return text;
  }

  // try refresh once on 401
  const refreshed = await refreshToken();
  if (!refreshed) {
    // refreshToken() already called logout()
    throw new Error("Unauthorized");
  }

  const newAccessToken = getAccessToken();
  const retryHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (newAccessToken) {
    retryHeaders["Authorization"] = `Bearer ${newAccessToken}`;
  }

  const retryResponse = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: retryHeaders,
  });

  // Handle retry response the same way
  const retryContentType = retryResponse.headers.get("content-type");
  const retryText = await retryResponse.text();
  
  if (!retryResponse.ok) {
    let errorMessage = `Request failed with status ${retryResponse.status}`;
    if (retryText) {
      try {
        const errorJson = JSON.parse(retryText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = retryText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }
  
  if (!retryText || retryText.trim() === "") {
    return null;
  }
  
  if (retryContentType?.includes("application/json")) {
    return JSON.parse(retryText);
  }
  
  return retryText;
}

export type DashboardSummaryResponse = {
  userName?: string;
  business?: any;
  metrics?: any;
  outcomes?: any;
  reviews?: any;
  sales?: any;
  activities?: any;
  insights?: any;
  generatedAt?: string;
  cockpit?: {
    setup: {
      completionPercent: number;
      completedCount: number;
      totalCount: number;
      isComplete: boolean;
      nextStepLabel: string;
      nextStepPath: string;
    };
    sales: {
      monthlyTarget: number;
      achievedThisMonth: number;
      monthlyGap: number;
      monthlyAchievementPercent: number;
      weeklyTarget: number;
      achievedThisWeek: number;
      weeklyGap: number;
      weeklyAchievementPercent: number;
      daysRemainingInWeek: number;
      weeksRemainingInMonth: number;
    };
    activities: {
      active: number;
      completed: number;
      weeklyActivityGoal: number;
      targetThisWeek: number;
      actualThisWeek: number;
      completionPercent: number;
      enableReminders: boolean;
      reminderDays: number[];
      dueToday: Array<{
        category?: string;
        priority?: string;
        weeklyGoal?: number;
        measurability?: string;
        impact?: string;
        relevance?: string;
      }>;
      weeklyItems: Array<{
        category: string;
        target: number;
        actual: number;
      }>;
    };
    outcomes: {
      planned: number;
      completed: number;
      completionPercent: number;
    };
    crm: {
      totalProspects: number;
      pipelineValue: number;
      convertedValue: number;
      activeFollowUps: number;
      byStatus: Record<string, number>;
      nextFollowUps: Array<{
        prospectName: string;
        status: string;
        proposalValue?: number | null;
        lastFollowUpAt?: string | null;
      }>;
    };
    achievement: {
      progressPercent: number;
      currentStage: {
        id: string;
        name: string;
        targetValue: number;
        percentOfGoal?: number | null;
        reward?: string | null;
      } | null;
      nextStage: {
        id: string;
        name: string;
        targetValue: number;
        percentOfGoal?: number | null;
        reward?: string | null;
      } | null;
      stages: Array<{
        id: string;
        name: string;
        targetValue: number;
        percentOfGoal?: number | null;
        reward?: string | null;
      }>;
    };
    insights: {
      momentumScore: number;
      streakCount: number;
      recommendations: string[];
    };
  };
};

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return await api("/api/v1/dashboard/summary");
}

export type GuidanceCardType = "next_action" | "insight" | "celebration";
export type GuidancePriority = "high" | "medium" | "low";
export type GuidanceSource = "setup" | "sales" | "crm" | "activity" | "profile";
export type GuidanceSignalStatus = "good" | "watch" | "risk";

export type DashboardGuidanceResponse = {
  summary: {
    title: string;
    message: string;
    tone: "encouraging";
    healthScore: number;
  };
  cards: Array<{
    id: string;
    type: GuidanceCardType;
    priority: GuidancePriority;
    title: string;
    message: string;
    actionLabel: string;
    actionRoute: string;
    source: GuidanceSource;
  }>;
  signals: Array<{
    key: string;
    label: string;
    value: number;
    unit: "count" | "percent" | "currency";
    status: GuidanceSignalStatus;
  }>;
  generatedAt?: string;
};

export async function getDashboardGuidance(): Promise<DashboardGuidanceResponse> {
  return await api("/api/v1/dashboard/guidance");
}

export async function getMetrics() {
  return await api("/api/v1/metrics");
}

export async function logMetric(metricId: string, value: number) {
  return await api(`/api/v1/metrics/${metricId}/logs`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

export async function getMetricLogs(metricId: string) {
  return await api(`/api/v1/metrics/${metricId}/logs`);
}

export async function getOutcomes(weekStart?: string) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return await api(`/api/v1/outcomes${params}`);
}

export async function createOutcome(title: string, weekStartDate: string, status: string = "Planned") {
  return await api("/api/v1/outcomes", {
    method: "POST",
    body: JSON.stringify({ title, weekStartDate, status }),
  });
}

export async function updateOutcome(id: string, updates: { title?: string; status?: string }) {
  return await api(`/api/v1/outcomes/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteOutcome(id: string) {
  return await api(`/api/v1/outcomes/${id}`, { method: "DELETE" });
}

// --- SALES ---
export async function getSalesPlanning(year?: number) {
  const currentYear = year || new Date().getFullYear();
  return await api(`/api/v1/sales/planning?year=${currentYear}`);
}

export async function updateSalesPlanning(payload: {
  year: number;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
}) {
  return await api("/api/v1/sales/planning", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSalesTracker(month?: string) {
  const currentMonth = month || new Date().toISOString().slice(0, 7); // "2026-01"
  return await api(`/api/v1/sales/tracker?month=${currentMonth}`);
}

export async function createSalesEntry(payload: {
  month: string;
  target?: number;
  achieved?: number;
  orders?: number;
  asp?: number;
  expenses?: number;
  profit?: number;
}) {
  return await api("/api/v1/sales/tracker", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type SalesProspectStatus = "COLD" | "WARM" | "HOT" | "CONVERTED" | "REJECTED";
export type SalesProspectReason =
  | "BUDGET"
  | "AUTHORITY"
  | "NEED"
  | "TIMELINE"
  | "AVAILABILITY"
  | "CLOSURE"
  | "OTHER";

export type SalesProspect = {
  id: string;
  month: string;
  firstCallAt: string | null;
  prospectName: string;
  mobileNumber: string | null;
  offeringType: string | null;
  proposalValue: number | null;
  referralSource: string | null;
  lastFollowUpAt: string | null;
  status: SalesProspectStatus;
  reason: SalesProspectReason | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SalesProspectPayload = {
  month: string;
  firstCallAt?: string;
  prospectName: string;
  mobileNumber?: string;
  offeringType?: string;
  proposalValue?: number;
  referralSource?: string;
  lastFollowUpAt?: string;
  status?: SalesProspectStatus;
  reason?: SalesProspectReason;
  remarks?: string;
};

export type SalesProspectListParams = {
  page?: number;
  pageSize?: number;
  month?: string;
  status?: SalesProspectStatus;
  reason?: SalesProspectReason;
  search?: string;
};

export type SalesProspectListResponse = {
  data: SalesProspect[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SalesProspectSummary = {
  totalProspects: number;
  pipelineValue: number;
  convertedCount: number;
  convertedValue: number;
  activeFollowUps: number;
  rejectedCount: number;
  byStatus: Partial<Record<SalesProspectStatus, number>>;
};

function toSalesProspectQuery(params: SalesProspectListParams | { month?: string }) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getSalesProspects(
  params: SalesProspectListParams = {},
): Promise<SalesProspectListResponse> {
  return await api(`/api/v1/sales/prospects${toSalesProspectQuery(params)}`);
}

export async function getSalesProspectSummary(month?: string): Promise<SalesProspectSummary> {
  return await api(`/api/v1/sales/prospects/summary${toSalesProspectQuery({ month })}`);
}

export async function createSalesProspect(payload: SalesProspectPayload): Promise<SalesProspect> {
  return await api("/api/v1/sales/prospects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSalesProspect(
  id: string,
  payload: Partial<SalesProspectPayload>,
): Promise<SalesProspect> {
  return await api(`/api/v1/sales/prospects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSalesProspect(id: string): Promise<{ deleted: boolean }> {
  return await api(`/api/v1/sales/prospects/${id}`, { method: "DELETE" });
}

// ------- REVIEWS -------
export async function getDailyReview() {
  return await api("/api/v1/reviews?type=Daily");
}

export async function submitDailyReview(payload: {
  mood?: number;
  content?: string;
  wins?: string;
  challenges?: string;
}) {
  return await api("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({ type: "Daily", ...payload }),
  });
}

export async function getWeeklyReview() {
  return await api("/api/v1/reviews?type=Weekly");
}

export async function submitWeeklyReview(payload: {
  mood?: number;
  content?: string;
  wins?: string;
  challenges?: string;
  lessons?: string;
}) {
  return await api("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({ type: "Weekly", ...payload }),
  });
}

// ----------- INSIGHTS -----------
export async function getInsightsSummary() {
  return await api("/api/v1/insights");
}

export async function getMomentumHistory() {
  return await api("/api/v1/insights/momentum");
}

export async function getStreakTrend() {
  return await api("/api/v1/insights/streak");
}

export async function getWeeklyConsistency() {
  // Weekly consistency is part of the main insights summary
  return await api("/api/v1/insights/summary");
}

export async function getActivityBreakdown() {
  // Activity breakdown is part of the main insights
  return await api("/api/v1/insights");
}

// ----------- ACTIVITIES -----------
export type ActivityRecord = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  priority?: string | null;
  status: "Active" | "Completed" | "Cancelled";
  dueDate?: string | null;
  createdAt: string;
};

export type ActivityPayload = {
  title: string;
  category: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  status?: "Active" | "Completed" | "Cancelled";
};

export async function getActivities(filters?: {
  category?: string;
  status?: string;
  priority?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.category) params.append("category", filters.category);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
  if (filters?.dueDateTo) params.append("dueDateTo", filters.dueDateTo);

  const queryString = params.toString();
  return await api(`/api/v1/activities${queryString ? `?${queryString}` : ""}`);
}

export async function createActivity(payload: ActivityPayload): Promise<ActivityRecord> {
  return await api("/api/v1/activities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateActivity(
  id: string,
  payload: Partial<ActivityPayload>,
): Promise<ActivityRecord> {
  return await api(`/api/v1/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ----------- SETTINGS -----------
// Profile uses /users/me endpoint
export async function getProfile() {
  return await api("/api/v1/users/me");
}

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  businessType?: string;
  socialHandles?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  painPoints?: {
    gettingCustomers?: boolean;
    pricing?: boolean;
    negotiating?: boolean;
    referrals?: boolean;
    retaining?: boolean;
    executingPlans?: boolean;
  };
}) {
  return await api("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Settings uses /settings endpoint (timezone, notifications)
export async function getSettings() {
  return await api("/api/v1/settings");
}

export async function updateSettings(payload: {
  timezone?: string;
  notificationsEmail?: boolean;
  notificationsPush?: boolean;
}) {
  return await api("/api/v1/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Business Setup Checklist
export async function getBusinessSetupChecklist() {
  return await api("/api/v1/settings/business-setup");
}

export async function updateBusinessSetupChecklist(payload: {
  uspDefined?: boolean;
  uspValue?: string;
  menuCardDefined?: boolean;
  menuCardValue?: string;
  packagesDefined?: boolean;
  packagesValue?: string;
  customerSegmentDefined?: boolean;
  customerSegmentValue?: string;
}) {
  return await api("/api/v1/settings/business-setup", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Legacy aliases for backward compatibility
export async function getBusinessSettings() {
  // Business info comes from user profile
  return await api("/api/v1/users/me");
}

export async function updateBusinessSettings(payload: {
  businessType?: string;
}) {
  return await api("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getNotificationSettings() {
  return await api("/api/v1/settings");
}

export async function updateNotificationSettings(payload: {
  notificationsEmail?: boolean;
  notificationsPush?: boolean;
}) {
  return await api("/api/v1/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ----------- AUTH ENHANCED -----------
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Invalid credentials");
  }

  return res.json();
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  businessType?: string;
}) {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message || "Registration failed");
  }

  return res.json();
}

// ----------- MFA -----------
export async function enrollMfa() {
  return await api("/api/v1/auth/mfa/enroll", { method: "POST" });
}

export async function enableMfa(code: string) {
  return await api("/api/v1/auth/mfa/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function disableMfa(code: string) {
  return await api("/api/v1/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ----------- SESSIONS -----------
export async function getMySessions() {
  return await api("/api/v1/sessions/my");
}

export async function revokeSession(sessionId: string) {
  return await api(`/api/v1/sessions/${sessionId}`, { method: "DELETE" });
}

export async function revokeAllSessions() {
  return await api("/api/v1/sessions/my/all", { method: "DELETE" });
}

// ----------- USERS / TEAM -----------
export async function getUsers() {
  return await api("/api/v1/users");
}

export async function getCurrentUser() {
  return await api("/api/v1/users/me");
}

export async function inviteUser(payload: { email: string; name: string; role: string }) {
  return await api("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(userId: string, role: string) {
  return await api(`/api/v1/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return await api(`/api/v1/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// ----------- METRICS CRUD -----------
export async function createMetric(payload: { name: string; target?: number }) {
  return await api("/api/v1/metrics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMetric(metricId: string, payload: { name?: string; target?: number }) {
  return await api(`/api/v1/metrics/${metricId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMetric(metricId: string) {
  return await api(`/api/v1/metrics/${metricId}`, { method: "DELETE" });
}

// ----------- TEMPLATES -----------
export async function getMetricTemplates() {
  return await api("/api/v1/templates/metrics");
}

export async function getOutcomeTemplates() {
  return await api("/api/v1/templates/outcomes");
}

export async function getActivityTemplates() {
  return await api("/api/v1/templates/activities");
}

export async function getTemplates() {
  // Aggregate all templates
  const [metrics, outcomes, activities] = await Promise.all([
    getMetricTemplates().catch(() => []),
    getOutcomeTemplates().catch(() => []),
    getActivityTemplates().catch(() => []),
  ]);
  return { metrics, outcomes, activities };
}

export async function createTemplate(payload: { name: string; target?: number; description?: string }) {
  throw new Error("Template creation is managed from Superadmin");
}

export async function updateTemplate(
  templateId: string,
  payload: { name?: string; target?: number; description?: string }
) {
  throw new Error("Template updates are managed from Superadmin");
}

export async function deleteTemplate(templateId: string) {
  throw new Error("Template deletion is managed from Superadmin");
}

// Apply template endpoints - creates actual items from templates
export async function applyMetricTemplate(templateId: string, customTarget?: number) {
  return await api(`/api/v1/templates/metrics/${templateId}/apply`, {
    method: "POST",
    body: JSON.stringify({ target: customTarget }),
  });
}

export async function applyActivityTemplate(templateId: string) {
  return await api(`/api/v1/templates/activities/${templateId}/apply`, {
    method: "POST",
  });
}

export async function applyOutcomeTemplate(templateId: string) {
  return await api(`/api/v1/templates/outcomes/${templateId}/apply`, {
    method: "POST",
  });
}

// ----------- REPORTS -----------
export type BusinessProfileReport = {
  metadata: {
    generatedAt: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    email?: string | null;
    domain?: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    businessType: string;
    businessDescription?: string | null;
    socialHandles?: Record<string, string> | null;
    painPoints?: Record<string, boolean> | null;
  };
  businessIdentity: {
    companyName?: string | null;
    customerType?: string | null;
    registrationStatus?: string | null;
    offeringType?: string | null;
    industry?: string | null;
    industryOther?: string | null;
    turnoverBand?: string | null;
    employeeRange?: string | null;
    website?: string | null;
    description?: string | null;
    usp?: string | null;
    keywords?: string[];
    offerings?: string[] | null;
  } | null;
  businessSetup: {
    uspDefined: boolean;
    uspValue?: string | null;
    menuCardDefined: boolean;
    menuCardValue?: string | null;
    packagesDefined: boolean;
    packagesValue?: string | null;
    customerSegmentDefined: boolean;
    customerSegmentValue?: string | null;
  } | null;
  salesPlan: (SalesPlanResponse & {
    expectedMonthlyRevenue: number;
    expectedMonthlyOrders: number;
    expectedMonthlyLeads: number;
  }) | null;
  activities: {
    weeklyActivityGoal: number;
    enableReminders: boolean;
    reminderDays: number[];
    enabledActivities: ActivityItem[];
    totalEnabledWeeklyGoal: number;
  };
  crm: {
    totalProspects: number;
    pipelineValue: number;
    convertedValue: number;
    activeFollowUps: number;
    byStatus: Partial<Record<SalesProspectStatus, number>>;
    nextFollowUps: Array<{
      prospectName: string;
      status: SalesProspectStatus;
      proposalValue?: number | null;
      lastFollowUpAt?: string | null;
    }>;
  };
  achievementStages: AchievementStageResponse[];
  businessSnapshot: {
    annualSales?: number | null;
    avgMonthlySales?: number | null;
    ordersPerMonth?: number | null;
    avgSellingPrice?: number | null;
    monthlyExpenses?: number | null;
    profitMargin?: number | null;
    suggestedNSM?: string | null;
  } | null;
};

export async function getBusinessProfileReport(): Promise<BusinessProfileReport> {
  return await api("/api/v1/reports/business-profile");
}

export async function generateReport(payload: { type: "weekly" | "monthly"; format?: string }) {
  return await api("/api/v1/reports/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------- NOTIFICATIONS -----------
export async function getNotifications() {
  const data = await api("/api/v1/notifications");
  return Array.isArray(data) ? data : data?.notifications ?? [];
}

export async function markNotificationRead(notificationId: string) {
  return await api(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return await api("/api/v1/notifications/read-all", {
    method: "PATCH",
  });
}

export async function getUnreadNotificationCount() {
  const data = await api("/api/v1/notifications/unread-count");
  return typeof data === "number" ? data : data?.count ?? 0;
}

// ----------- SUPPORT -----------
function toApiEnum(value?: string) {
  return value ? value.toUpperCase() : value;
}

function toWebEnum(value?: string | null) {
  return value ? value.toLowerCase() : value;
}

function normalizeTicketComment(comment: any) {
  return {
    ...comment,
    userName: comment?.userName ?? comment?.user?.name ?? comment?.user?.email ?? "Team member",
  };
}

function normalizeSupportTicket(ticket: any) {
  if (!ticket) return ticket;
  return {
    ...ticket,
    status: toWebEnum(ticket.status),
    priority: toWebEnum(ticket.priority),
    comments: Array.isArray(ticket.comments)
      ? ticket.comments.map(normalizeTicketComment)
      : ticket.comments,
  };
}

export async function getSupportTickets() {
  const data = await api("/api/v1/support/tickets/my");
  const tickets = Array.isArray(data) ? data : data?.data ?? [];
  return tickets.map(normalizeSupportTicket);
}

export async function createSupportTicket(payload: { subject: string; message: string; priority?: string }) {
  const ticket = await api("/api/v1/support/tickets", {
    method: "POST",
    body: JSON.stringify({ ...payload, priority: toApiEnum(payload.priority) }),
  });
  return normalizeSupportTicket(ticket);
}

export async function getSupportTicket(ticketId: string) {
  return normalizeSupportTicket(await api(`/api/v1/support/tickets/${ticketId}`));
}

export async function addTicketComment(ticketId: string, message: string) {
  return normalizeTicketComment(
    await api(`/api/v1/support/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  );
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const ticket = await api(`/api/v1/support/tickets/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: toApiEnum(status) }),
  });
  return normalizeSupportTicket(ticket);
}

// ----------- ONBOARDING -----------

// Enums matching backend - exported as const objects for runtime use
export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const MaritalStatus = {
  SINGLE: "SINGLE",
  MARRIED: "MARRIED",
  DIVORCED: "DIVORCED",
  WIDOWED: "WIDOWED",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;
export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];

export const CompanyType = {
  SOLE_PROPRIETORSHIP: "SOLE_PROPRIETORSHIP",
  PARTNERSHIP: "PARTNERSHIP",
  LLC: "LLC",
  CORPORATION: "CORPORATION",
  NON_PROFIT: "NON_PROFIT",
  COOPERATIVE: "COOPERATIVE",
  OTHER: "OTHER",
} as const;
export type CompanyType = (typeof CompanyType)[keyof typeof CompanyType];

export const Industry = {
  TECHNOLOGY: "TECHNOLOGY",
  HEALTHCARE: "HEALTHCARE",
  FINANCE: "FINANCE",
  RETAIL: "RETAIL",
  MANUFACTURING: "MANUFACTURING",
  EDUCATION: "EDUCATION",
  REAL_ESTATE: "REAL_ESTATE",
  HOSPITALITY: "HOSPITALITY",
  CONSULTING: "CONSULTING",
  MARKETING: "MARKETING",
  CONSTRUCTION: "CONSTRUCTION",
  TRANSPORTATION: "TRANSPORTATION",
  AGRICULTURE: "AGRICULTURE",
  ENTERTAINMENT: "ENTERTAINMENT",
  OTHER: "OTHER",
} as const;
export type Industry = (typeof Industry)[keyof typeof Industry];

export const TurnoverBand = {
  UNDER_1L: "UNDER_1L",
  L1_TO_5L: "L1_TO_5L",
  L5_TO_10L: "L5_TO_10L",
  L10_TO_25L: "L10_TO_25L",
  L25_TO_50L: "L25_TO_50L",
  L50_TO_1CR: "L50_TO_1CR",
  CR1_TO_5CR: "CR1_TO_5CR",
  CR5_TO_10CR: "CR5_TO_10CR",
  ABOVE_10CR: "ABOVE_10CR",
} as const;
export type TurnoverBand = (typeof TurnoverBand)[keyof typeof TurnoverBand];

export const EmployeeRange = {
  SOLO: "SOLO",
  MICRO: "MICRO",
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type EmployeeRange = (typeof EmployeeRange)[keyof typeof EmployeeRange];

export const CustomerType = {
  B2B: "B2B",
  B2C: "B2C",
  BOTH: "BOTH",
} as const;
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const BusinessRegistrationStatus = {
  REGISTERED: "REGISTERED",
  UNREGISTERED: "UNREGISTERED",
  IN_PROGRESS: "IN_PROGRESS",
} as const;
export type BusinessRegistrationStatus =
  (typeof BusinessRegistrationStatus)[keyof typeof BusinessRegistrationStatus];

export const OfferingType = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
  BOTH: "BOTH",
} as const;
export type OfferingType = (typeof OfferingType)[keyof typeof OfferingType];

export const SubscriptionPlan = {
  FREE: "FREE",
  STARTER: "STARTER",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export interface OnboardingStepFlags {
  profileCompleted: boolean;
  businessIdentityCompleted: boolean;
  salesPlanCompleted: boolean;
  activityConfigCompleted: boolean;
  salesCycleCompleted: boolean;
  achievementStagesCompleted: boolean;
  subscriptionCompleted: boolean;
  visualSetupCompleted: boolean;
}

// Raw response from backend (stepFlags is nested)
interface OnboardingProgressRaw {
  id: string;
  tenantId: string;
  currentStep: number;
  stepsCompleted: string[];
  isCompleted: boolean;
  completedAt: string | null;
  selectedPlan?: SubscriptionPlan;
  stepTitles?: Record<string, string>;
  totalSteps?: number;
  stepFlags?: OnboardingStepFlags;
  createdAt: string;
  updatedAt: string;
}

// Flattened interface for frontend use
export interface OnboardingProgress extends Partial<OnboardingStepFlags> {
  id: string;
  tenantId: string;
  currentStep: number;
  stepsCompleted: string[];
  isCompleted: boolean;
  completedAt: string | null;
  selectedPlan?: SubscriptionPlan;
  stepTitles?: Record<string, string>;
  totalSteps?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    age?: number;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    businessDescription?: string;
    socialHandles?: SocialHandles;
    painPoints?: PainPoints;
  };
}

// Helper to flatten stepFlags from backend response
function flattenOnboardingProgress(raw: OnboardingProgressRaw): OnboardingProgress {
  const { stepFlags, ...rest } = raw;
  return {
    ...rest,
    profileCompleted: stepFlags?.profileCompleted ?? false,
    businessIdentityCompleted: stepFlags?.businessIdentityCompleted ?? false,
    salesPlanCompleted: stepFlags?.salesPlanCompleted ?? false,
    activityConfigCompleted: stepFlags?.activityConfigCompleted ?? false,
    salesCycleCompleted: stepFlags?.salesCycleCompleted ?? false,
    achievementStagesCompleted: stepFlags?.achievementStagesCompleted ?? false,
    subscriptionCompleted: stepFlags?.subscriptionCompleted ?? false,
    visualSetupCompleted: stepFlags?.visualSetupCompleted ?? false,
  };
}

export interface UpdateOnboardingPayload {
  currentStep?: number;
  completedStep?: string;
  isCompleted?: boolean;
}

// Profile Onboarding (Step 1)
export interface SocialHandles {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface PainPoints {
  gettingCustomers?: boolean;
  pricing?: boolean;
  negotiating?: boolean;
  referrals?: boolean;
  retaining?: boolean;
  executingPlans?: boolean;
}

export interface ProfileOnboardingPayload {
  name?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  businessType?: "Solopreneur" | "Startup" | "MSME";
  businessDescription?: string;
  socialHandles?: SocialHandles;
  painPoints?: PainPoints;
}

export interface ProfileOnboardingResponse {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  businessType: string;
  businessDescription?: string;
  socialHandles?: SocialHandles;
  painPoints?: PainPoints;
  updatedAt: string;
}

// Business Identity (Step 2)
export interface BusinessIdentityPayload {
  companyName?: string;
  companyType?: CompanyType;
  customerType?: CustomerType;
  registrationStatus?: BusinessRegistrationStatus;
  offeringType?: OfferingType;
  industry?: Industry;
  industryOther?: string;
  foundedYear?: number;
  businessAge?: number;
  turnoverBand?: TurnoverBand;
  employeeRange?: EmployeeRange;
  website?: string;
  description?: string;
  usp?: string;
  keywords?: string[];
  offerings?: string[];
}

export interface BusinessIdentityResponse {
  id: string;
  tenantId: string;
  companyName?: string;
  companyType?: CompanyType;
  customerType?: CustomerType;
  registrationStatus?: BusinessRegistrationStatus;
  offeringType?: OfferingType;
  industry?: Industry;
  industryOther?: string;
  foundedYear?: number;
  businessAge?: number;
  turnoverBand?: TurnoverBand;
  employeeRange?: EmployeeRange;
  website?: string;
  description?: string;
  usp?: string;
  keywords?: string[];
  offerings?: string[];
  createdAt: string;
  updatedAt: string;
}

// Sales Plan (Step 3)
export interface SalesPlanPayload {
  yearMinus3Value?: number;
  yearMinus2Value?: number;
  yearMinus1Value?: number;
  projectedYearValue: number;
  monthlyContribution: number[]; // length 12, sums to ~100
  averageTicketSize: number;
  conversionRatio: number;
  existingCustomerContribution: number;
  newCustomerContribution: number;
}

export interface SalesPlanResponse {
  id: string;
  tenantId: string;
  yearMinus3Value?: number;
  yearMinus2Value?: number;
  yearMinus1Value?: number;
  projectedYearValue: number;
  monthlyContribution: number[];
  monthlyTargets: number[]; // calculated by backend
  averageTicketSize: number;
  conversionRatio: number;
  existingCustomerContribution: number;
  newCustomerContribution: number;
  monthlyOrderTargets: number[];
  monthlyLeadTargets: number[];
  existingCustomerTarget: number;
  newCustomerTarget: number;
  createdAt: string;
  updatedAt: string;
}

// Activity Configuration (Step 4)
export interface ActivityItem {
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  weeklyGoal: number;
  reminderDays: number[];
  measurability: string;
  impact: string;
  relevance: "PRODUCT" | "SERVICE" | "BOTH";
  enabled?: boolean;
}

export interface ActivityConfigurationPayload {
  salesEnabled?: boolean;
  marketingEnabled?: boolean;
  networkingEnabled?: boolean;
  productDevEnabled?: boolean;
  operationsEnabled?: boolean;
  weeklyActivityGoal?: number;
  enableReminders?: boolean;
  reminderDays?: number[];
  activities: ActivityItem[];
}

export interface ActivityConfigurationResponse {
  id: string;
  tenantId: string;
  salesEnabled: boolean;
  marketingEnabled: boolean;
  networkingEnabled: boolean;
  productDevEnabled: boolean;
  operationsEnabled: boolean;
  weeklyActivityGoal: number;
  enableReminders: boolean;
  reminderDays: number[];
  activities?: ActivityItem[];
  createdAt: string;
  updatedAt: string;
}

// Sales Cycle Stage (Step 5)
export interface SalesCycleStagePayload {
  name: string;
  orderIndex: number;
  probability: number;
  avgDurationDays: number;
}

export interface SalesCycleSetupPayload {
  stages: SalesCycleStagePayload[];
}

export interface SalesCycleStageResponse {
  id: string;
  tenantId: string;
  name: string;
  orderIndex: number;
  probability: number;
  avgDurationDays: number;
  createdAt: string;
  updatedAt: string;
}

// Achievement Stages (Step 6)
export interface AchievementStagePayload {
  name: string;
  order: number;
  targetValue: number;
  percentOfGoal?: number;
  color?: string;
  icon?: string;
  reward?: string;
  isActive?: boolean;
}

export interface AchievementStagesSetupPayload {
  stages: AchievementStagePayload[];
}

export interface AchievementStageResponse {
  id: string;
  tenantId: string;
  name: string;
  order: number;
  targetValue: number;
  percentOfGoal?: number;
  color?: string;
  icon?: string;
  reward?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementStagesSetupResponse {
  stages: AchievementStageResponse[];
  totalStages: number;
}

// Subscription Selection (Step 7)
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface SubscriptionSelectionPayload {
  plan: SubscriptionPlan;
}

export interface SubscriptionSelectionResponse {
  selectedPlan: SubscriptionPlan;
  planFeatures: {
    maxUsers: number;
    maxMetrics: number;
    maxActivities: number;
    features: string[];
    price: string;
  };
}

// Onboarding API Functions
export async function getOnboardingState(): Promise<OnboardingProgress> {
  const raw: OnboardingProgressRaw = await api("/api/v1/onboarding");
  return flattenOnboardingProgress(raw);
}

export async function updateOnboarding(payload: UpdateOnboardingPayload): Promise<OnboardingProgress> {
  const raw: OnboardingProgressRaw = await api("/api/v1/onboarding", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return flattenOnboardingProgress(raw);
}

export async function updateOnboardingProfile(payload: ProfileOnboardingPayload): Promise<ProfileOnboardingResponse> {
  return await api("/api/v1/onboarding/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getBusinessIdentity(): Promise<BusinessIdentityResponse | null> {
  return await api("/api/v1/onboarding/business-identity");
}

export async function upsertBusinessIdentity(payload: BusinessIdentityPayload): Promise<BusinessIdentityResponse> {
  return await api("/api/v1/onboarding/business-identity", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSalesPlan(): Promise<SalesPlanResponse | null> {
  return await api("/api/v1/onboarding/sales-plan");
}

export async function upsertSalesPlan(payload: SalesPlanPayload): Promise<SalesPlanResponse> {
  return await api("/api/v1/onboarding/sales-plan", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getActivityConfiguration(): Promise<ActivityConfigurationResponse | null> {
  return await api("/api/v1/onboarding/activity-setup");
}

export async function upsertActivityConfiguration(payload: ActivityConfigurationPayload): Promise<ActivityConfigurationResponse> {
  return await api("/api/v1/onboarding/activity-setup", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSalesCycle(): Promise<SalesCycleSetupResponse | null> {
  return await api("/api/v1/onboarding/sales-cycle");
}

export async function upsertSalesCycle(payload: SalesCycleSetupPayload): Promise<SalesCycleSetupResponse> {
  return await api("/api/v1/onboarding/sales-cycle", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function applyDefaultSalesCycle(): Promise<SalesCycleSetupResponse> {
  return await api("/api/v1/onboarding/sales-cycle/defaults", {
    method: "POST",
  });
}

export async function getAchievementStages(): Promise<AchievementStagesSetupResponse | null> {
  return await api("/api/v1/onboarding/achievement-stages");
}

export async function upsertAchievementStages(payload: AchievementStagesSetupPayload): Promise<AchievementStagesSetupResponse> {
  return await api("/api/v1/onboarding/achievement-stages", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSubscriptionSelection(): Promise<SubscriptionSelectionResponse | null> {
  return await api("/api/v1/onboarding/subscription");
}

export async function selectSubscription(payload: SubscriptionSelectionPayload): Promise<SubscriptionSelectionResponse> {
  return await api("/api/v1/onboarding/subscription", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function completeOnboarding(): Promise<OnboardingProgress> {
  const raw: OnboardingProgressRaw = await api("/api/v1/onboarding/complete", {
    method: "POST",
  });
  return flattenOnboardingProgress(raw);
}

// ============================================
// SALES TARGETS & SUMMARY
// ============================================

export type AchievementStage = {
  name: string;
  minPercentage: number;
  maxPercentage: number;
  color?: string;
};

export type SalesTargetsResponse = {
  year: number;
  currentMonth: number;
  currentWeek: number;
  monthlyTarget: number;
  weeklyTarget: number;
  achievedThisMonth: number;
  achievedThisWeek: number;
  monthlyAchievementPercent: number;
  weeklyAchievementPercent: number;
  daysRemainingInWeek: number;
  weeksRemainingInMonth: number;
};

export type MonthlyTargetItem = {
  month: number;
  monthName: string;
  contributionPercent: number;
  targetValue: number;
  weeksInMonth: number;
};

export type WeeklyTargetItem = {
  weekNumber: number;
  month: number;
  monthName: string;
  weekInMonth: number;
  weeklyTarget: number;
  cumulativeTarget: number;
};

export type SalesSummaryResponse = {
  planning: {
    id: string;
    year: number;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    growthPct: number;
  } | null;
  tracker: {
    id: string;
    month: string;
    target: number;
    achieved: number;
    orders: number;
    asp: number;
    profit: number;
  } | null;
  progress: number;
  year: number;
  month: string;
  validation: {
    weeklyPlan: {
      quarter: number;
      quarterKey: string;
      isConfigured: boolean;
      weeklyTarget: number;
      weeksElapsed: number;
      expectedToDate: number;
      status: string;
      message: string;
    };
    dailyTracker: {
      status: string;
      targetPerDay: number;
      achievedPerDay: number;
      variance: number;
      isCurrentMonth: boolean;
    };
    planVsActual: {
      quarter: number;
      planned: number;
      actual: number;
      variance: number;
      attainment: number;
      status: string;
    };
    weeklyRollover: {
      status: string;
      requiresRollover: boolean;
      currentMonth: string;
      previousMonth: string;
      carryForward: {
        month: string;
        target: number;
        achieved: number;
      } | null;
    };
  };
  targets: {
    monthlyTarget: number;
    weeklyTarget: number;
    achievedThisMonth: number;
    achievedThisWeek: number;
    monthlyAchievementPercent: number;
    weeklyAchievementPercent: number;
    daysRemainingInWeek: number;
    weeksRemainingInMonth: number;
  };
};

/**
 * Get current period sales targets with achievement data
 */
export async function getSalesTargets(): Promise<SalesTargetsResponse> {
  return await api("/api/v1/sales/targets");
}

/**
 * Get all monthly targets for the year
 */
export async function getMonthlyTargets(): Promise<MonthlyTargetItem[]> {
  return await api("/api/v1/sales/targets/monthly");
}

/**
 * Get all 52 weekly targets for the year
 */
export async function getWeeklyTargets(): Promise<WeeklyTargetItem[]> {
  return await api("/api/v1/sales/targets/weekly");
}

/**
 * Get sales summary with targets (enhanced)
 */
export async function getSalesSummary(): Promise<SalesSummaryResponse> {
  return await api("/api/v1/sales/summary");
}

// ============================================
// SALES WEEKLY SUMMARY TYPES & API
// ============================================

export type WeeklySalesSummaryItem = {
  week: number;
  target: number;
  achieved: number;
  achievementPercent: number;
  stage?: {
    name: string;
    minPercentage: number;
    maxPercentage: number;
    color?: string;
  } | null;
};

export type WeeklySalesSummaryResponse = {
  year: number;
  fromWeek: number;
  toWeek: number;
  items: WeeklySalesSummaryItem[];
};

/**
 * Get weekly sales summary trend for a range of weeks
 * Default: last 6 weeks including current
 */
export async function getSalesWeeklySummary(params?: {
  year?: number;
  fromWeek?: number;
  toWeek?: number;
}): Promise<WeeklySalesSummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.year) searchParams.append("year", String(params.year));
  if (params?.fromWeek) searchParams.append("fromWeek", String(params.fromWeek));
  if (params?.toWeek) searchParams.append("toWeek", String(params.toWeek));
  
  const query = searchParams.toString();
  return await api(`/api/v1/sales/weekly-summary${query ? `?${query}` : ""}`);
}

// ============================================
// ACTIVITY WEEKLY SUMMARY TYPES & API
// ============================================

export type WeeklyActivitySummaryItem = {
  category: string;
  target: number;
  actual: number;
  completionPercent: number;
};

export type WeeklyActivitySummaryResponse = {
  year: number;
  week: number;
  items: WeeklyActivitySummaryItem[];
  overallCompletionPercent: number;
};

/**
 * Get weekly activity summary comparing targets vs actual
 * Default: current week
 */
export async function getWeeklyActivitySummary(params?: {
  year?: number;
  week?: number;
}): Promise<WeeklyActivitySummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.year) searchParams.append("year", String(params.year));
  if (params?.week) searchParams.append("week", String(params.week));
  
  const query = searchParams.toString();
  return await api(`/api/v1/activities/weekly-summary${query ? `?${query}` : ""}`);
}

// ============================================
// OUTCOMES WEEKLY SUMMARY TYPES & API
// ============================================

export type WeeklyOutcomesSummaryResponse = {
  year: number;
  week: number;
  planned: number;
  completed: number;
  completionPercent: number;
};

/**
 * Get weekly outcomes summary comparing planned vs completed
 * Default: current week
 */
export async function getWeeklyOutcomesSummary(params?: {
  year?: number;
  week?: number;
}): Promise<WeeklyOutcomesSummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.year) searchParams.append("year", String(params.year));
  if (params?.week) searchParams.append("week", String(params.week));
  
  const query = searchParams.toString();
  return await api(`/api/v1/outcomes/weekly-summary${query ? `?${query}` : ""}`);
}

// ============================================
// WEEKLY DIAGNOSTICS TYPES & API
// ============================================

export type DiagnosticType = "SALES" | "ACTIVITY" | "OUTCOME";
export type DiagnosticLevel = "SUCCESS" | "WARNING" | "CRITICAL";

export type WeeklyDiagnostic = {
  type: DiagnosticType;
  level: DiagnosticLevel;
  message: string;
};

export type WeeklyDiagnosticsResponse = {
  year: number;
  week: number;
  diagnostics: WeeklyDiagnostic[];
  summary: {
    salesAchievementPercent: number;
    activityCompletionPercent: number;
    outcomeCompletionPercent: number;
    momentumEffect: number;
  };
};

/**
 * Get weekly diagnostics explaining performance changes
 * Rule-based diagnostic engine (not AI)
 * Default: current week
 */
export async function getWeeklyDiagnostics(params?: {
  year?: number;
  week?: number;
}): Promise<WeeklyDiagnosticsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.year) searchParams.append("year", String(params.year));
  if (params?.week) searchParams.append("week", String(params.week));
  
  const query = searchParams.toString();
  return await api(`/api/v1/insights/weekly-diagnostics${query ? `?${query}` : ""}`);
}

// ============================================
// WEEKLY SALES ENTRY TYPES & API
// ============================================

export type WeeklySalesEntryResponse = {
  id: string | null;
  year: number;
  week: number;
  achieved: number;
  orders: number;
  notes: string | null;
  target: number;
  achievementPercent: number;
  status: "exceeded" | "achieved" | "below";
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Get weekly sales entry for a specific week
 */
export async function getWeeklySalesEntry(year: number, week: number): Promise<WeeklySalesEntryResponse> {
  return await api(`/api/v1/sales/weekly-entry?year=${year}&week=${week}`);
}

/**
 * Get all weekly sales entries for a year
 */
export async function getWeeklySalesEntries(year: number): Promise<WeeklySalesEntryResponse[]> {
  return await api(`/api/v1/sales/weekly-entry?year=${year}`);
}

/**
 * Create or update weekly sales entry
 */
export async function logWeeklySales(data: {
  year: number;
  week: number;
  achieved: number;
  orders?: number;
  notes?: string;
}): Promise<WeeklySalesEntryResponse> {
  return await api("/api/v1/sales/weekly-entry", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
