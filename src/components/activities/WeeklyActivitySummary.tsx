import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Activity, RefreshCw, Settings } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import type { WeeklyActivitySummaryItem } from "@/lib/api";

interface WeeklyActivitySummaryProps {
  data?: {
    year: number;
    week: number;
    items: WeeklyActivitySummaryItem[];
    overallCompletionPercent: number;
  };
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

/**
 * Get progress bar color class based on completion percentage
 * <50% → destructive (red)
 * 50-80% → warning (yellow/amber)
 * >80% → success (green)
 */
function getProgressColorClass(percent: number): string {
  const clamped = clamp(percent, 0, 100);
  if (clamped < 50) return "bg-destructive";
  if (clamped <= 80) return "bg-amber-500";
  return "bg-green-500";
}

/**
 * Get text color class based on completion percentage
 */
function getTextColorClass(percent: number): string {
  const clamped = clamp(percent, 0, 100);
  if (clamped < 50) return "text-destructive";
  if (clamped <= 80) return "text-amber-600";
  return "text-green-600";
}

export const WeeklyActivitySummary = React.memo(function WeeklyActivitySummary({
  data,
  isLoading,
  isError,
  onRetry,
}: WeeklyActivitySummaryProps) {
  // Loading state
  if (isLoading) {
    return <CardSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load activity summary"
            description="There was an error fetching your weekly activity data."
            action={onRetry}
            actionLabel="Retry"
          />
        </CardContent>
      </Card>
    );
  }

  // No items / not configured state
  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Settings}
            title="Activity targets not configured"
            description="Complete onboarding to enable activity tracking and see your weekly progress."
          />
        </CardContent>
      </Card>
    );
  }

  const overallPercent = clamp(data.overallCompletionPercent, 0, 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5" />
          This Week's Activity Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity items */}
        {data.items.map((item) => {
          const percent = clamp(item.completionPercent, 0, 100);
          const progressColor = getProgressColorClass(percent);
          const textColor = getTextColorClass(percent);

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {item.actual} / {item.target}
                  </span>
                  <span className={cn("font-medium min-w-[3.5rem] text-right", textColor)}>
                    {Math.round(percent)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full transition-all duration-300", progressColor)}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Overall completion summary */}
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn("h-5 w-5", getTextColorClass(overallPercent))} />
              <span className="font-medium">Overall Activity Completion</span>
            </div>
            <span className={cn("text-lg font-bold", getTextColorClass(overallPercent))}>
              {Math.round(overallPercent)}%
            </span>
          </div>
          <div className="mt-2 relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all duration-300", getProgressColorClass(overallPercent))}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default WeeklyActivitySummary;
