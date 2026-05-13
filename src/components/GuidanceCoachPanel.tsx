import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  CircleGauge,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  DashboardGuidanceResponse,
  GuidanceCardType,
  GuidancePriority,
  GuidanceSource,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type GuidanceCoachPanelProps = {
  guidance?: DashboardGuidanceResponse;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
};

const sourceLabels: Record<GuidanceSource, string> = {
  setup: "Setup",
  sales: "Sales",
  crm: "CRM",
  activity: "Activity",
  profile: "Profile",
};

const priorityStyles: Record<GuidancePriority, string> = {
  high: "border-l-4 border-l-amber-500 bg-amber-50/70",
  medium: "border-l-4 border-l-blue-500 bg-blue-50/70",
  low: "border-l-4 border-l-emerald-500 bg-emerald-50/70",
};

const typeIcons: Record<GuidanceCardType, typeof Lightbulb> = {
  next_action: Lightbulb,
  insight: CircleGauge,
  celebration: CheckCircle,
};

function normalizeRoute(route: string) {
  if (route === "/setup") return "/onboarding";
  if (route === "/sales/prospects") return "/sales";
  return route || "/dashboard";
}

export function GuidanceCoachPanel({
  guidance,
  isLoading,
  isError,
  isFetching,
  onRefresh,
}: GuidanceCoachPanelProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-7 w-80 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-20 w-28" />
        </div>
      </section>
    );
  }

  if (isError || !guidance) {
    return (
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Momentum Coach</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              Your guidance will return shortly
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The dashboard is still available. Refresh when you want to reload
              today's focus.
            </p>
          </div>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </section>
    );
  }

  const primaryCard = guidance.cards[0];
  const healthScore = Math.max(0, Math.min(100, guidance.summary.healthScore));

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-card">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Momentum Coach
            </Badge>
            <Badge variant="outline">
              {guidance.summary.journeyStage ?? "Business Health"}
            </Badge>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
            {guidance.summary.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {guidance.summary.message}
          </p>
          {primaryCard?.why && (
            <p className="mt-3 max-w-3xl rounded-md border bg-muted/40 px-3 py-2 text-sm leading-5 text-muted-foreground">
              <span className="font-medium text-foreground">Why this matters:</span>{" "}
              {primaryCard.why}
            </p>
          )}

          {primaryCard && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to={normalizeRoute(primaryCard.actionRoute)}>
                <Button className="gap-2">
                  {primaryCard.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {primaryCard.afterActionMessage && (
                <p className="text-sm text-muted-foreground">
                  After action: {primaryCard.afterActionMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t bg-emerald-50/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Business Health
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {healthScore}
              </p>
            </div>
            <CircleGauge className="h-9 w-9 text-primary" />
          </div>
          <Progress value={healthScore} className="mt-4 h-2" />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Based on setup, sales progress, CRM rhythm, and weekly activity.
          </p>
        </div>
      </div>

      {guidance.cards.length > 0 && (
        <div className="grid gap-3 border-t bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-3">
          {guidance.cards.slice(0, 3).map((card) => {
            const Icon = typeIcons[card.type];
            return (
              <div
                key={card.id}
                className={`rounded-md border p-4 ${priorityStyles[card.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-soft">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{card.title}</p>
                      <Badge variant="outline" className="bg-white/70">
                        {sourceLabels[card.source]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {card.message}
                    </p>
                    {card.why && (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">Why:</span>{" "}
                        {card.why}
                      </p>
                    )}
                    <Link
                      to={normalizeRoute(card.actionRoute)}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      {card.actionLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFetching && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Refreshing guidance...
        </div>
      )}
    </section>
  );
}
