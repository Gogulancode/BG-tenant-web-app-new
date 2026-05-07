import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getMetrics, getOutcomes } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Rocket,
  X,
  ChevronDown,
  ChevronUp,
  Trophy,
  Sparkles,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  isComplete: boolean;
}

interface FirstWeekChecklistProps {
  onDismiss?: () => void;
}

export function FirstWeekChecklist({ onDismiss }: FirstWeekChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem("firstWeekChecklistDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  // Fetch data to determine completion status
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
  });

  const { data: metricsData } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    staleTime: 60 * 1000,
  });

  const { data: outcomesData } = useQuery({
    queryKey: ["outcomes"],
    queryFn: () => getOutcomes(),
    staleTime: 60 * 1000,
  });

  // Parse data
  const metrics = Array.isArray(metricsData) ? metricsData : [];
  const outcomes = Array.isArray(outcomesData)
    ? outcomesData
    : outcomesData?.data ?? [];

  const hasMetrics = metrics.length > 0;
  const hasOutcomes = outcomes.length > 0;
  const hasLoggedMetric = (dashboardData?.metrics?.totalMetrics ?? 0) > 0;
  const hasCompletedOutcome = outcomes.some((o: any) => o.status === "Done");
  const hasStreak = (dashboardData?.insights?.streakCount ?? 0) >= 3;
  const momentumAbove50 = (dashboardData?.insights?.momentumScore ?? 0) >= 50;

  // Define checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: "onboarding",
      title: "Complete onboarding",
      description: "Set up your business profile and preferences",
      isComplete: true, // Always true if they're seeing this
    },
    {
      id: "first-metric",
      title: "Add your first metric",
      description: "Create a number you want to track daily",
      link: "/metrics",
      linkLabel: "Go to Metrics",
      isComplete: hasMetrics,
    },
    {
      id: "first-outcome",
      title: "Create your first outcome",
      description: "Set a goal to achieve this week",
      link: "/outcomes",
      linkLabel: "Go to Outcomes",
      isComplete: hasOutcomes,
    },
    {
      id: "log-metric",
      title: "Log a metric value",
      description: "Record your first data point",
      link: "/today",
      linkLabel: "Quick Log",
      isComplete: hasLoggedMetric,
    },
    {
      id: "complete-outcome",
      title: "Mark an outcome as Done",
      description: "Complete a goal to build momentum",
      link: "/outcomes",
      linkLabel: "View Outcomes",
      isComplete: hasCompletedOutcome,
    },
    {
      id: "three-day-streak",
      title: "Achieve a 3-day streak",
      description: "Log activity for 3 consecutive days",
      isComplete: hasStreak,
    },
    {
      id: "momentum-50",
      title: "Reach 50% momentum",
      description: "Build consistency to boost your score",
      isComplete: momentumAbove50,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.isComplete).length;
  const totalCount = checklistItems.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  const handleDismiss = () => {
    localStorage.setItem("firstWeekChecklistDismissed", "true");
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't show if dismissed or all complete
  if (isDismissed) {
    return null;
  }

  // Show celebration if all complete
  if (allComplete) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  🎉 You're a Quick Starter!
                </h3>
                <p className="text-sm text-green-700">
                  You've completed all first-week tasks. Keep up the great work!
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Your First Week Checklist</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete these to master the platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {completedCount}/{totalCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-3" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  item.isComplete
                    ? "bg-green-50"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                {item.isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.isComplete ? "text-green-800 line-through" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {!item.isComplete && item.link && (
                  <Link to={item.link}>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      {item.linkLabel}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Complete all to unlock the "Quick Starter" badge!
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs">
              Hide for now
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default FirstWeekChecklist;
