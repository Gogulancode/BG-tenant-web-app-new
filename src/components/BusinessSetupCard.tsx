import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBusinessSetupChecklist, updateBusinessSetupChecklist } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Rocket, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BusinessSetupChecklistData {
  uspDefined: boolean;
  menuCardDefined: boolean;
  packagesDefined: boolean;
  customerSegmentDefined: boolean;
  completionPercent: number;
}

interface ChecklistItem {
  key: "uspDefined" | "menuCardDefined" | "packagesDefined" | "customerSegmentDefined";
  label: string;
  description: string;
}

const checklistItems: ChecklistItem[] = [
  {
    key: "uspDefined",
    label: "Define Your USP",
    description: "What makes your business unique?",
  },
  {
    key: "menuCardDefined",
    label: "Create Menu Card",
    description: "List your services/products with pricing",
  },
  {
    key: "packagesDefined",
    label: "Define Packages",
    description: "Bundle your offerings into packages",
  },
  {
    key: "customerSegmentDefined",
    label: "Define Customer Segments",
    description: "Identify your ideal customer profiles",
  },
];

export function BusinessSetupCard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<BusinessSetupChecklistData>({
    queryKey: ["business-setup-checklist"],
    queryFn: getBusinessSetupChecklist,
    staleTime: 60 * 1000,
  });

  const updateChecklist = useMutation({
    mutationFn: updateBusinessSetupChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-setup-checklist"] });
      toast.success("Progress saved!");
    },
    onError: () => {
      toast.error("Failed to save progress");
    },
  });

  const handleToggle = (key: ChecklistItem["key"], checked: boolean) => {
    updateChecklist.mutate({ [key]: checked });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return null;
  }

  // Don't show if 100% complete
  if (data.completionPercent === 100) {
    return null;
  }

  const completedCount = checklistItems.filter((item) => data[item.key]).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Get Started
        </CardTitle>
        <CardDescription>
          Complete these steps to set up your business foundation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {checklistItems.length} completed
            </span>
            <span className="font-medium">{data.completionPercent}%</span>
          </div>
          <Progress value={data.completionPercent} className="h-2" />
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
          {checklistItems.map((item) => {
            const isChecked = data[item.key];
            return (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isChecked ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggle(item.key, checked as boolean)
                  }
                  disabled={updateChecklist.isPending}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        isChecked ? "text-green-700 dark:text-green-400 line-through" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                    {isChecked && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement message */}
        {completedCount > 0 && completedCount < checklistItems.length && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Great progress! Keep going!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
