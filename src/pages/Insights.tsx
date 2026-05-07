import { useEffect, useState } from "react";
import {
  getInsightsSummary,
  getMomentumHistory,
  getStreakTrend,
  getWeeklyConsistency,
  getActivityBreakdown,
} from "../lib/api";
import { useWeeklyDiagnostics } from "@/hooks/useInsights";
import { WeeklyDiagnosticsPanel } from "@/components/insights";
import { getCurrentWeekNumber } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard, KpiCardSkeleton } from "@/components/ui/kpi-card";
import { ChartSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Flame, Flag, BarChart3, PieChartIcon, Activity } from "lucide-react";

// Consistent chart colors using design system
const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#8b5cf6"];

function getFlagColor(flag: string): "green" | "yellow" | "red" {
  if (flag === "GREEN" || flag?.toLowerCase() === "green") return "green";
  if (flag === "YELLOW" || flag?.toLowerCase() === "yellow") return "yellow";
  return "red";
}

export default function Insights() {
  const [summary, setSummary] = useState<any>(null);
  const [momentum, setMomentum] = useState<any[]>([]);
  const [streak, setStreak] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Weekly diagnostics (current week)
  const currentWeek = getCurrentWeekNumber();
  const {
    data: diagnosticsData,
    isLoading: diagnosticsLoading,
    isError: diagnosticsError,
    refetch: refetchDiagnostics,
  } = useWeeklyDiagnostics({ week: currentWeek });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, m, st, w, a] = await Promise.all([
          getInsightsSummary(),
          getMomentumHistory(),
          getStreakTrend(),
          getWeeklyConsistency(),
          getActivityBreakdown(),
        ]);

        setSummary(s || {});
        setMomentum(Array.isArray(m) ? m : []);
        setStreak(Array.isArray(st) ? st : []);
        setWeekly(Array.isArray(w) ? w : []);
        setActivity(Array.isArray(a) ? a : []);
      } catch (error) {
        console.error("Failed to load insights:", error);
        setSummary({});
        setMomentum([]);
        setStreak([]);
        setWeekly([]);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Insights" description="Loading..." />
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Momentum Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartSkeleton height={280} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Streak Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartSkeleton height={280} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const flagColor = getFlagColor(summary?.flags);
  const flagColorClass = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  }[flagColor];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Insights"
        description="Your execution intelligence overview."
      />

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Momentum Score"
          value={summary?.momentumScore ?? 0}
          icon={TrendingUp}
          trend={summary?.momentumScore >= 70 ? "up" : summary?.momentumScore >= 40 ? "neutral" : "down"}
          subtitle={summary?.momentumScore >= 70 ? "Strong momentum" : summary?.momentumScore >= 40 ? "Building momentum" : "Needs attention"}
        />

        <KpiCard
          title="Current Streak"
          value={`${summary?.streakCount ?? 0} days`}
          icon={Flame}
          trend={summary?.streakCount >= 7 ? "up" : summary?.streakCount >= 3 ? "neutral" : "down"}
          subtitle={summary?.streakCount >= 7 ? "Excellent consistency" : summary?.streakCount >= 3 ? "Keep it going" : "Start building"}
        />

        <Card className="app-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status Flag</p>
                <p className={`text-2xl font-bold mt-1 ${flagColorClass}`}>
                  {summary?.flags ?? "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {flagColor === "green" ? "On track" : flagColor === "yellow" ? "Monitor closely" : "Needs action"}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-muted/50`}>
                <Flag className={`h-6 w-6 ${flagColorClass}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WEEKLY DIAGNOSTICS */}
      <WeeklyDiagnosticsPanel
        data={diagnosticsData}
        isLoading={diagnosticsLoading}
        isError={diagnosticsError}
        onRetry={() => refetchDiagnostics()}
      />

      {/* CHARTS GRID */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MOMENTUM TREND */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Momentum Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {momentum.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={momentum}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="momentum" 
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.success, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No momentum data"
                description="Start completing outcomes to see your momentum trend."
              />
            )}
          </CardContent>
        </Card>

        {/* STREAK TREND */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Streak Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streak.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={streak}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="days" 
                    stroke={CHART_COLORS.info}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.info, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Flame}
                title="No streak data"
                description="Build your streak by consistently logging activities."
              />
            )}
          </CardContent>
        </Card>

        {/* WEEKLY CONSISTENCY */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="consistency" 
                    fill={CHART_COLORS.warning}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No consistency data"
                description="Complete weekly reviews to track your consistency."
              />
            )}
          </CardContent>
        </Card>

        {/* ACTIVITY BREAKDOWN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={activity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) =>
                      `${type}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {activity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Activity}
                title="No activity data"
                description="Log activities to see your breakdown by category."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
