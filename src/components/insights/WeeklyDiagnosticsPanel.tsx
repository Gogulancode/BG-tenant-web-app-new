import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Activity,
  Target,
  DollarSign,
} from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import type { WeeklyDiagnosticsResponse, DiagnosticLevel, DiagnosticType } from "@/lib/api";

interface WeeklyDiagnosticsPanelProps {
  data?: WeeklyDiagnosticsResponse;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

/**
 * Get icon based on diagnostic level
 */
function getLevelIcon(level: DiagnosticLevel) {
  switch (level) {
    case "SUCCESS":
      return CheckCircle2;
    case "WARNING":
      return AlertTriangle;
    case "CRITICAL":
      return AlertCircle;
    default:
      return AlertTriangle;
  }
}

/**
 * Get color classes based on diagnostic level
 */
function getLevelStyles(level: DiagnosticLevel): { iconClass: string; bgClass: string; borderClass: string } {
  switch (level) {
    case "SUCCESS":
      return {
        iconClass: "text-green-600",
        bgClass: "bg-green-50 dark:bg-green-950/30",
        borderClass: "border-l-green-500",
      };
    case "WARNING":
      return {
        iconClass: "text-amber-600",
        bgClass: "bg-amber-50 dark:bg-amber-950/30",
        borderClass: "border-l-amber-500",
      };
    case "CRITICAL":
      return {
        iconClass: "text-red-600",
        bgClass: "bg-red-50 dark:bg-red-950/30",
        borderClass: "border-l-red-500",
      };
    default:
      return {
        iconClass: "text-muted-foreground",
        bgClass: "bg-muted/50",
        borderClass: "border-l-muted",
      };
  }
}

/**
 * Get badge variant for diagnostic type
 */
function getTypeBadge(type: DiagnosticType): { label: string; className: string } {
  switch (type) {
    case "SALES":
      return { label: "Sales", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" };
    case "ACTIVITY":
      return { label: "Activity", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" };
    case "OUTCOME":
      return { label: "Outcome", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" };
    default:
      return { label: type, className: "" };
  }
}

/**
 * Clamp and format percentage for display
 */
function formatPercent(value: number): string {
  const clamped = clamp(value, 0, 200);
  return `${Math.round(clamped)}%`;
}

/**
 * Get momentum effect display info
 */
function getMomentumEffectInfo(effect: number): { icon: typeof TrendingUp; className: string; label: string } {
  if (effect > 0) {
    return {
      icon: TrendingUp,
      className: "text-green-600",
      label: `+${effect}`,
    };
  }
  if (effect < 0) {
    return {
      icon: TrendingDown,
      className: "text-red-600",
      label: `${effect}`,
    };
  }
  return {
    icon: Minus,
    className: "text-muted-foreground",
    label: "0",
  };
}

export const WeeklyDiagnosticsPanel = React.memo(function WeeklyDiagnosticsPanel({
  data,
  isLoading,
  isError,
  onRetry,
}: WeeklyDiagnosticsPanelProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Weekly Diagnostics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What impacted your momentum this week
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary strip skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
          <Separator />
          {/* Diagnostic list skeleton */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load diagnostics"
            description="There was an error fetching your weekly diagnostics data."
            action={onRetry}
            actionLabel="Retry"
          />
        </CardContent>
      </Card>
    );
  }

  // Check if there are any warning or critical diagnostics
  const hasActionableItems = data?.diagnostics?.some(
    (d) => d.level === "WARNING" || d.level === "CRITICAL"
  );

  const summary = data?.summary;
  const momentumInfo = getMomentumEffectInfo(summary?.momentumEffect ?? 0);
  const MomentumIcon = momentumInfo.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Weekly Diagnostics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What impacted your momentum this week
          {data && ` (Week ${data.week}, ${data.year})`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Sales % */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Sales
            </div>
            <p className="text-lg font-semibold">
              {formatPercent(summary?.salesAchievementPercent ?? 0)}
            </p>
          </div>

          {/* Activity % */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5" />
              Activity
            </div>
            <p className="text-lg font-semibold">
              {formatPercent(summary?.activityCompletionPercent ?? 0)}
            </p>
          </div>

          {/* Outcomes % */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Target className="h-3.5 w-3.5" />
              Outcomes
            </div>
            <p className="text-lg font-semibold">
              {formatPercent(summary?.outcomeCompletionPercent ?? 0)}
            </p>
          </div>

          {/* Momentum Effect */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MomentumIcon className={cn("h-3.5 w-3.5", momentumInfo.className)} />
              Momentum
            </div>
            <div className="flex items-center gap-2">
              <p className={cn("text-lg font-semibold", momentumInfo.className)}>
                {momentumInfo.label}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-0",
                  summary?.momentumEffect && summary.momentumEffect > 0
                    ? "border-green-500 text-green-600"
                    : summary?.momentumEffect && summary.momentumEffect < 0
                    ? "border-red-500 text-red-600"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                effect
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Diagnostic List */}
        <div className="space-y-3">
          {!data?.diagnostics || data.diagnostics.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-500">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                No issues detected. Keep steady execution.
              </p>
            </div>
          ) : (
            data.diagnostics.map((diagnostic, index) => {
              const LevelIcon = getLevelIcon(diagnostic.level);
              const levelStyles = getLevelStyles(diagnostic.level);
              const typeBadge = getTypeBadge(diagnostic.type);

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-l-4",
                    levelStyles.bgClass,
                    levelStyles.borderClass
                  )}
                >
                  <LevelIcon
                    className={cn("h-5 w-5 flex-shrink-0 mt-0.5", levelStyles.iconClass)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={cn("text-xs", typeBadge.className)}>
                        {typeBadge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{diagnostic.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* CTA Buttons - only show when actionable items exist */}
      {hasActionableItems && (
        <CardFooter className="pt-0 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/activities">Improve Activities</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/outcomes">Review Outcomes</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});

export default WeeklyDiagnosticsPanel;
