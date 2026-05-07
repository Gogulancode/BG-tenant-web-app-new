import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle,
  Clock,
  DollarSign,
  Flame,
  ListChecks,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import { getDashboardSummary } from "../lib/api";
import { formatCurrencyINR, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard, KpiCardSkeleton } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FirstWeekChecklist } from "@/components/FirstWeekChecklist";
import { BusinessSetupCard } from "@/components/BusinessSetupCard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatLabel(value?: string | null) {
  if (!value) return "Not set";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pct(value?: number) {
  return formatPercent(Math.max(0, Math.min(100, value || 0)));
}

function FocusItem({
  title,
  description,
  action,
  to,
}: {
  title: string;
  description: string;
  action: string;
  to: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Link to={to} className="shrink-0">
        <Button variant="outline" size="sm" className="gap-2">
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{pct(value)}</span>
      </div>
      <Progress value={Math.max(0, Math.min(100, value || 0))} className="h-2" />
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

const Dashboard = () => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
  });

  const greeting = getGreeting();
  const userName = data?.userName || "there";
  const cockpit = data?.cockpit;

  const hasData = Boolean(
    cockpit &&
      (cockpit.insights.momentumScore > 0 ||
        cockpit.sales.weeklyTarget > 0 ||
        cockpit.activities.targetThisWeek > 0 ||
        cockpit.crm.totalProspects > 0),
  );

  const focusItems = useMemo(() => {
    if (!cockpit) return [];

    const items = [];

    if (!cockpit.setup.isComplete) {
      items.push({
        title: cockpit.setup.nextStepLabel,
        description: `${cockpit.setup.completionPercent}% of your business foundation is complete.`,
        action: "Continue setup",
        to: cockpit.setup.nextStepPath,
      });
    }

    cockpit.activities.dueToday.slice(0, 2).forEach((activity) => {
      items.push({
        title: activity.category || "Planned activity",
        description:
          activity.impact ||
          `Weekly goal: ${activity.weeklyGoal || 0}. Measure: ${
            activity.measurability || "completion"
          }.`,
        action: "Open activities",
        to: "/activities",
      });
    });

    cockpit.crm.nextFollowUps.slice(0, 2).forEach((followUp) => {
      items.push({
        title: `Follow up: ${followUp.prospectName}`,
        description: `${formatLabel(followUp.status)} prospect worth ${formatCurrencyINR(
          followUp.proposalValue || 0,
        )}.`,
        action: "Open CRM",
        to: "/sales",
      });
    });

    if (items.length === 0) {
      items.push({
        title: "Review today's plan",
        description: "Check Today for metric logging, outcomes, and execution notes.",
        action: "Go to Today",
        to: "/today",
      });
    }

    return items.slice(0, 4);
  }, [cockpit]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Skeleton className="h-[320px] xl:col-span-2" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  if (isError || !data || !cockpit) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${greeting}, ${userName}!`}
          description="Here's your accountability overview"
        />
        <EmptyState
          icon={BarChart3}
          title="Unable to load dashboard"
          description="There was an error loading your dashboard data. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title={`${greeting}, ${userName}!`}
          description="Your operating cockpit for this week"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link to="/today">
            <Button className="gap-2">
              Open Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {!hasData && <FirstWeekChecklist />}
      {!cockpit.setup.isComplete && <BusinessSetupCard />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Weekly Sales Gap"
          value={formatCurrencyINR(cockpit.sales.weeklyGap)}
          description={`${formatCurrencyINR(cockpit.sales.achievedThisWeek)} of ${formatCurrencyINR(
            cockpit.sales.weeklyTarget,
          )}`}
          icon={DollarSign}
          variant="primary"
        />
        <KpiCard
          title="Activity Completion"
          value={pct(cockpit.activities.completionPercent)}
          description={`${cockpit.activities.actualThisWeek} of ${cockpit.activities.targetThisWeek} planned actions`}
          icon={Activity}
        />
        <KpiCard
          title="Outcomes Completed"
          value={pct(cockpit.outcomes.completionPercent)}
          description={`${cockpit.outcomes.completed} of ${cockpit.outcomes.planned} commitments`}
          icon={CheckCircle}
        />
        <KpiCard
          title="Active Follow-ups"
          value={cockpit.crm.activeFollowUps}
          description={`${formatCurrencyINR(cockpit.crm.pipelineValue)} pipeline`}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusItems.map((item) => (
              <FocusItem
                key={`${item.title}-${item.to}`}
                title={item.title}
                description={item.description}
                action={item.action}
                to={item.to}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-primary" />
              Execution Pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressRow
              label="Sales"
              value={cockpit.sales.weeklyAchievementPercent}
              helper={`${cockpit.sales.daysRemainingInWeek} days left this week`}
            />
            <ProgressRow
              label="Activities"
              value={cockpit.activities.completionPercent}
              helper={`${cockpit.activities.active} active actions on the board`}
            />
            <ProgressRow
              label="Outcomes"
              value={cockpit.outcomes.completionPercent}
              helper={`${cockpit.outcomes.completed} completed commitments`}
            />
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              Momentum score:{" "}
              <span className="font-semibold text-foreground">
                {Math.round(cockpit.insights.momentumScore)}
              </span>
              {" | "}
              Streak:{" "}
              <span className="font-semibold text-foreground">
                {cockpit.insights.streakCount} days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Sales And CRM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Month Gap
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrencyINR(cockpit.sales.monthlyGap)}
                </p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Converted
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrencyINR(cockpit.crm.convertedValue)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {cockpit.crm.nextFollowUps.length > 0 ? (
                cockpit.crm.nextFollowUps.slice(0, 3).map((followUp) => (
                  <div
                    key={`${followUp.prospectName}-${followUp.status}`}
                    className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{followUp.prospectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatLabel(followUp.status)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatCurrencyINR(followUp.proposalValue || 0)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active follow-ups yet. Add prospects in Sales to build your pipeline.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Activity Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cockpit.activities.weeklyItems.length > 0 ? (
              cockpit.activities.weeklyItems.map((item) => (
                <div key={item.category} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="font-medium text-foreground">{item.category}</p>
                    <p className="text-muted-foreground">
                      {item.actual}/{item.target}
                    </p>
                  </div>
                  <Progress
                    value={item.target > 0 ? Math.min(100, (item.actual / item.target) * 100) : 0}
                    className="mt-3 h-2"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Configure weekly activities during onboarding to see your execution plan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Achievement Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium text-muted-foreground">Current Stage</p>
            <p className="mt-2 text-xl font-semibold">
              {cockpit.achievement.currentStage?.name || "Not reached yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pct(cockpit.achievement.progressPercent)} month progress
            </p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium text-muted-foreground">Next Stage</p>
            <p className="mt-2 text-xl font-semibold">
              {cockpit.achievement.nextStage?.name || "All stages reached"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {cockpit.achievement.nextStage
                ? formatCurrencyINR(cockpit.achievement.nextStage.targetValue)
                : "Review and raise targets"}
            </p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
            <p className="mt-2 text-sm text-foreground">
              {cockpit.insights.recommendations[0] ||
                "Keep sales follow-ups and weekly commitments moving today."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
