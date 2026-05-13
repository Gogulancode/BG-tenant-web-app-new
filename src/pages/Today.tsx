import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Circle,
  CloudSun,
  DollarSign,
  Frown,
  Loader2,
  Meh,
  Moon,
  Plus,
  RefreshCw,
  Smile,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getDashboardSummary,
  getMetrics,
  getOutcomes,
  logMetric,
  logWeeklySales,
  submitDailyReview,
  updateOutcome,
} from "@/lib/api";
import type { DashboardSummaryResponse } from "@/lib/api";
import { useCreateActivity } from "@/hooks/useActivities";
import { formatCurrencyINR, formatPercent } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { invalidateSalesOperatingData } from "@/lib/queryInvalidation";

interface Outcome {
  id: string;
  title: string;
  status: string;
  weekStartDate: string;
}

interface Metric {
  id: string;
  name: string;
  target?: number;
}

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 17) return { text: "Good afternoon", icon: CloudSun };
  return { text: "Good evening", icon: Moon };
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((diffDays + 1) / 7);
  return Math.max(1, Math.min(52, week));
}

function formatLabel(value?: string | null) {
  if (!value) return "Not set";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function percent(value?: number) {
  return formatPercent(Math.max(0, Math.min(100, value || 0)));
}

function MomentumCard({ data }: { data?: DashboardSummaryResponse }) {
  const cockpit = data?.cockpit;
  const score =
    cockpit?.insights?.momentumScore ?? data?.insights?.momentumScore ?? 0;
  const streak =
    cockpit?.insights?.streakCount ?? data?.insights?.streakCount ?? 0;
  const recommendation =
    cockpit?.insights?.recommendations?.[0] ||
    "Move one sales, activity, or outcome item forward today.";

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <p className="font-medium text-foreground">
              Today’s execution focus
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{recommendation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-background p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round(score)}%
            </p>
            <p className="text-xs text-muted-foreground">Momentum</p>
          </div>
          <div className="rounded-md bg-background p-3 text-center">
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesLogCard({
  cockpit,
}: {
  cockpit: NonNullable<
    Awaited<ReturnType<typeof getDashboardSummary>>["cockpit"]
  >;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentDate = new Date();
  const [achieved, setAchieved] = useState(
    cockpit.sales.achievedThisWeek
      ? String(cockpit.sales.achievedThisWeek)
      : "",
  );
  const [orders, setOrders] = useState("");
  const [notes, setNotes] = useState("");

  const saveSales = useMutation({
    mutationFn: () =>
      logWeeklySales({
        year: currentDate.getFullYear(),
        week: getWeekNumber(currentDate),
        achieved: Number(achieved || 0),
        orders: orders ? Number(orders) : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      invalidateSalesOperatingData(queryClient);
      toast({ title: "Weekly sales saved" });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to save sales",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-5 w-5 text-primary" />
          Weekly Sales Log
        </CardTitle>
        <CardDescription>
          {formatCurrencyINR(cockpit.sales.weeklyGap)} left against this week’s
          target
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatCurrencyINR(cockpit.sales.achievedThisWeek)} achieved
            </span>
            <span>{percent(cockpit.sales.weeklyAchievementPercent)}</span>
          </div>
          <Progress
            value={Math.min(100, cockpit.sales.weeklyAchievementPercent)}
            className="mt-2 h-2"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="number"
            min="0"
            placeholder="Achieved amount"
            value={achieved}
            onChange={(event) => setAchieved(event.target.value)}
          />
          <Input
            type="number"
            min="0"
            placeholder="Orders closed"
            value={orders}
            onChange={(event) => setOrders(event.target.value)}
          />
        </div>
        <Textarea
          placeholder="Short note for this week"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-20"
        />
        <Button
          onClick={() => saveSales.mutate()}
          disabled={saveSales.isPending || !achieved}
          className="w-full"
        >
          {saveSales.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Weekly Sales"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ActivityExecutionCard({
  cockpit,
}: {
  cockpit: NonNullable<
    Awaited<ReturnType<typeof getDashboardSummary>>["cockpit"]
  >;
}) {
  const { toast } = useToast();
  const createActivity = useCreateActivity();

  const handleComplete = (activity: {
    category?: string;
    priority?: string;
    impact?: string;
    measurability?: string;
  }) => {
    createActivity.mutate(
      {
        title: activity.category || "Business development activity",
        category: activity.category || "Sales",
        description: [activity.impact, activity.measurability]
          .filter(Boolean)
          .join(" | "),
        priority:
          activity.priority === "HIGH"
            ? "High"
            : activity.priority === "LOW"
              ? "Low"
              : "Medium",
        dueDate: new Date().toISOString(),
        status: "Completed",
      },
      {
        onSuccess: () => toast({ title: "Activity completed" }),
        onError: (error: Error) =>
          toast({
            title: "Unable to complete activity",
            description: error.message,
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-primary" />
          Activity Execution
        </CardTitle>
        <CardDescription>
          {cockpit.activities.actualThisWeek} of{" "}
          {cockpit.activities.targetThisWeek} weekly actions done
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress
          value={Math.min(100, cockpit.activities.completionPercent)}
          className="h-2"
        />
        {cockpit.activities.dueToday.length > 0 ? (
          <div className="space-y-3">
            {cockpit.activities.dueToday.slice(0, 4).map((activity) => (
              <div
                key={`${activity.category}-${activity.priority}`}
                className="rounded-md border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {activity.category}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.impact ||
                        activity.measurability ||
                        "Complete this action today."}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatLabel(activity.priority)}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  disabled={createActivity.isPending}
                  onClick={() => handleComplete(activity)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Done
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No configured activities are due today.
            </p>
            <Link to="/onboarding">
              <Button variant="ghost" size="sm" className="mt-2">
                Review activity setup
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CrmFollowUpCard({
  cockpit,
}: {
  cockpit: NonNullable<
    Awaited<ReturnType<typeof getDashboardSummary>>["cockpit"]
  >;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          CRM Follow-ups
        </CardTitle>
        <CardDescription>
          {cockpit.crm.activeFollowUps} warm or hot prospects need attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {cockpit.crm.nextFollowUps.length > 0 ? (
          cockpit.crm.nextFollowUps.slice(0, 4).map((prospect) => (
            <div
              key={`${prospect.prospectName}-${prospect.status}`}
              className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {prospect.prospectName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatLabel(prospect.status)}
                </p>
              </div>
              <Badge variant="outline">
                {formatCurrencyINR(prospect.proposalValue || 0)}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No active CRM follow-ups yet. Add warm prospects in Sales.
          </p>
        )}
        <Link to="/sales">
          <Button variant="outline" className="w-full">
            Open Sales CRM
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function OutcomesCard({
  outcomes,
  isLoading,
  onToggle,
}: {
  outcomes: Outcome[];
  isLoading: boolean;
  onToggle: (outcome: Outcome) => void;
}) {
  const completed = outcomes.filter(
    (outcome) => outcome.status === "Done",
  ).length;
  const progress =
    outcomes.length > 0 ? (completed / outcomes.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-primary" />
          Weekly Outcomes
        </CardTitle>
        <CardDescription>
          {completed} of {outcomes.length} commitments completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-2" />
        {outcomes.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <Circle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No outcomes set for this week.
            </p>
            <Link to="/outcomes">
              <Button size="sm" className="mt-3">
                <Plus className="mr-2 h-4 w-4" />
                Add Outcome
              </Button>
            </Link>
          </div>
        ) : (
          outcomes.slice(0, 5).map((outcome) => (
            <div
              key={outcome.id}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
            >
              <Checkbox
                checked={outcome.status === "Done"}
                onCheckedChange={() => onToggle(outcome)}
              />
              <span
                className={`flex-1 text-sm ${
                  outcome.status === "Done"
                    ? "text-muted-foreground line-through"
                    : ""
                }`}
              >
                {outcome.title}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function QuickLogCard({
  metrics,
  isLoading,
  onLog,
}: {
  metrics: Metric[];
  isLoading: boolean;
  onLog: (metricId: string, value: number) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const handleLog = async (metricId: string) => {
    const value = Number(values[metricId]);
    if (!Number.isFinite(value)) return;
    setLoggingId(metricId);
    await onLog(metricId, value);
    setValues((current) => ({ ...current, [metricId]: "" }));
    setLoggingId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((item) => (
            <Skeleton key={item} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Quick Metrics
        </CardTitle>
        <CardDescription>
          Log today’s numbers without leaving the page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No metrics configured yet.
            </p>
            <Link to="/metrics">
              <Button size="sm" className="mt-3">
                Add Metric
              </Button>
            </Link>
          </div>
        ) : (
          metrics.slice(0, 4).map((metric) => (
            <div
              key={metric.id}
              className="flex items-center gap-2 rounded-md bg-muted/40 p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{metric.name}</p>
                {metric.target && (
                  <p className="text-xs text-muted-foreground">
                    Target {metric.target.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <Input
                type="number"
                placeholder="Value"
                value={values[metric.id] || ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [metric.id]: event.target.value,
                  }))
                }
                className="h-9 w-24"
              />
              <Button
                size="sm"
                disabled={!values[metric.id] || loggingId === metric.id}
                onClick={() => handleLog(metric.id)}
              >
                {loggingId === metric.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Log"
                )}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ReflectionCard() {
  const [mood, setMood] = useState<number | null>(null);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!mood) return;
    setIsSubmitting(true);
    try {
      await submitDailyReview({
        mood,
        wins: wins || undefined,
        challenges: challenges || undefined,
      });
      setSubmitted(true);
      toast({ title: "Reflection saved" });
    } catch (error) {
      toast({
        title: "Unable to save reflection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <p className="font-medium text-green-800">
            Today’s reflection is saved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          Daily Reflection
        </CardTitle>
        <CardDescription>Capture one win and one learning</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 3, icon: Smile, label: "Great" },
            { value: 2, icon: Meh, label: "Okay" },
            { value: 1, icon: Frown, label: "Tough" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={mood === option.value ? "default" : "outline"}
              onClick={() => setMood(option.value)}
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </Button>
          ))}
        </div>
        <Input
          placeholder="One win today"
          value={wins}
          onChange={(event) => setWins(event.target.value)}
        />
        <Input
          placeholder="One challenge or lesson"
          value={challenges}
          onChange={(event) => setChallenges(event.target.value)}
        />
        <Button
          className="w-full"
          disabled={!mood || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Reflection"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Today() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const greeting = getGreeting();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
  });

  const { data: outcomesData, isLoading: outcomesLoading } = useQuery({
    queryKey: ["outcomes"],
    queryFn: () => getOutcomes(),
    staleTime: 60 * 1000,
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    staleTime: 60 * 1000,
  });

  const outcomes: Outcome[] = Array.isArray(outcomesData)
    ? outcomesData
    : (outcomesData?.data ?? []);
  const metrics: Metric[] = Array.isArray(metricsData) ? metricsData : [];
  const cockpit = dashboardData?.cockpit;

  const toggleOutcome = useMutation({
    mutationFn: async (outcome: Outcome) => {
      const newStatus = outcome.status === "Done" ? "Planned" : "Done";
      return updateOutcome(outcome.id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outcomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({ title: "Outcome updated" });
    },
    onError: () => {
      toast({
        title: "Unable to update outcome",
        variant: "destructive",
      });
    },
  });

  const handleLogMetric = async (metricId: string, value: number) => {
    try {
      await logMetric(metricId, value);
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({ title: "Metric logged" });
    } catch (error) {
      toast({
        title: "Unable to log metric",
        variant: "destructive",
      });
    }
  };

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <greeting.icon className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting.text}, {dashboardData?.userName || "there"}!
            </h1>
          </div>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full gap-2 sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {dashboardLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <MomentumCard data={dashboardData} />
      )}

      {cockpit ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Sales Gap</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrencyINR(cockpit.sales.weeklyGap)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {percent(cockpit.sales.weeklyAchievementPercent)} of weekly
                  target
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Activity Execution
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {percent(cockpit.activities.completionPercent)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cockpit.activities.actualThisWeek}/
                  {cockpit.activities.targetThisWeek} done
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">CRM Follow-ups</p>
                <p className="mt-2 text-2xl font-semibold">
                  {cockpit.crm.activeFollowUps}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrencyINR(cockpit.crm.pipelineValue)} pipeline
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <SalesLogCard cockpit={cockpit} />
              <ActivityExecutionCard cockpit={cockpit} />
              <OutcomesCard
                outcomes={outcomes}
                isLoading={outcomesLoading}
                onToggle={(outcome) => toggleOutcome.mutate(outcome)}
              />
            </div>
            <div className="space-y-6">
              <CrmFollowUpCard cockpit={cockpit} />
              <QuickLogCard
                metrics={metrics}
                isLoading={metricsLoading}
                onLog={handleLogMetric}
              />
              <ReflectionCard />
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Today’s execution workspace is loading.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
