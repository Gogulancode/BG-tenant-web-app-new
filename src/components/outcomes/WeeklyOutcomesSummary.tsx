import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { AlertCircle, CheckCircle2, Target, Plus, AlertTriangle } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import type { WeeklyOutcomesSummaryResponse } from "@/lib/api";

interface WeeklyOutcomesSummaryProps {
  data?: WeeklyOutcomesSummaryResponse;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

/**
 * Get badge variant and label based on completion percentage
 * >= 80%: "On track" (green)
 * 50-79%: "Needs focus" (yellow)
 * < 50%: "At risk" (red)
 */
function getCompletionBadge(percent: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string } {
  const clamped = clamp(percent, 0, 100);
  
  if (clamped >= 80) {
    return { 
      label: "On track", 
      variant: "default",
      className: "bg-green-500 hover:bg-green-600"
    };
  }
  if (clamped >= 50) {
    return { 
      label: "Needs focus", 
      variant: "secondary",
      className: "bg-amber-500 hover:bg-amber-600 text-white"
    };
  }
  return { 
    label: "At risk", 
    variant: "destructive",
    className: ""
  };
}

/**
 * Get progress bar color class based on completion percentage
 */
function getProgressColorClass(percent: number): string {
  const clamped = clamp(percent, 0, 100);
  if (clamped < 50) return "bg-destructive";
  if (clamped < 80) return "bg-amber-500";
  return "bg-green-500";
}

export const WeeklyOutcomesSummary = React.memo(function WeeklyOutcomesSummary({
  data,
  isLoading,
  isError,
  onRetry,
}: WeeklyOutcomesSummaryProps) {
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
            title="Failed to load outcomes summary"
            description="There was an error fetching your weekly commitments data."
            action={onRetry}
            actionLabel="Retry"
          />
        </CardContent>
      </Card>
    );
  }

  // No outcomes planned state
  if (!data || data.planned === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Commitments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No outcomes set for this week yet.
            </p>
            <Button asChild size="sm">
              <Link to="/outcomes">
                <Plus className="h-4 w-4 mr-1" />
                Add outcomes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionPercent = clamp(data.completionPercent, 0, 100);
  const badge = getCompletionBadge(completionPercent);
  const progressColorClass = getProgressColorClass(completionPercent);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Commitments
          </CardTitle>
          <Badge 
            variant={badge.variant}
            className={cn(badge.className)}
          >
            {badge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <span className="text-lg font-semibold">
            {data.completed} / {data.planned}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all", progressColorClass)}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{Math.round(completionPercent)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Week indicator */}
        <p className="text-xs text-muted-foreground text-center">
          Week {data.week}, {data.year}
        </p>
      </CardContent>
    </Card>
  );
});

export default WeeklyOutcomesSummary;
