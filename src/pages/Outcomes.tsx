import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOutcomes, createOutcome, updateOutcome } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Plus, ListChecks, Loader2, RotateCcw } from "lucide-react";

// API response interface - matches backend Outcome model
interface OutcomeApiResponse {
  id: string;
  title: string;
  status: "Planned" | "Done" | "Missed";
  weekStartDate: string;
}

// Internal interface for UI
interface Outcome {
  id: string;
  title: string;
  weekStartDate: string;
  status: "Planned" | "Done" | "Missed";
  completed: boolean;
}

const createOutcomeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  weekStartDate: z.string().min(1, "Week start date is required"),
});

type CreateOutcomeFormData = z.infer<typeof createOutcomeSchema>;

export default function Outcomes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: outcomesData, isLoading } = useQuery({
    queryKey: ["outcomes"],
    queryFn: () => getOutcomes(),
  });

  // Handle both array and paginated response formats and transform API response
  const rawOutcomes: OutcomeApiResponse[] = Array.isArray(outcomesData) 
    ? outcomesData 
    : (outcomesData?.data ?? []);
  
  // Map API response to UI format
  const outcomes: Outcome[] = rawOutcomes.map((o) => ({
    ...o,
    completed: o.status === "Done",
  }));

  const createMutation = useMutation({
    mutationFn: (data: CreateOutcomeFormData) => createOutcome(data.title, data.weekStartDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outcomes"] });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Outcome created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create outcome",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (outcome: Outcome) => 
      updateOutcome(outcome.id, { status: outcome.completed ? "Planned" : "Done" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outcomes"] });
      toast({
        title: "Success",
        description: "Outcome updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update outcome",
        variant: "destructive",
      });
    },
  });

  // Calculate current week's Monday as default
  const getDefaultWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const form = useForm<CreateOutcomeFormData>({
    resolver: zodResolver(createOutcomeSchema),
    defaultValues: {
      title: "",
      weekStartDate: getDefaultWeekStart(),
    },
  });

  const onSubmit = (data: CreateOutcomeFormData) => {
    createMutation.mutate(data);
  };

  const completedCount = outcomes.filter((o: Outcome) => o.completed).length;
  const totalCount = outcomes.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-28" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Outcomes"
        description={`Plan and complete your weekly outcomes. ${completedCount} of ${totalCount} completed.`}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Outcome
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Outcome</DialogTitle>
              <DialogDescription>
                Create a new outcome to track this week.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Launch new feature" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weekStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week Starting</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Outcome
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Progress Card */}
      {totalCount > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Weekly Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Outcomes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            This Week's Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outcomes.length === 0 ? (
            <div className="py-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ListChecks className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">What Will You Accomplish This Week?</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Outcomes are your weekly goals. Aim for 3-5 meaningful outcomes that move your business forward.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto mb-6 text-left">
                <p className="text-sm font-medium mb-2">Good outcomes are:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ <strong>Specific:</strong> "Close deal with ABC Corp" not "Get more sales"</li>
                  <li>✓ <strong>Achievable:</strong> 3-5 per week, not 20</li>
                  <li>✓ <strong>Meaningful:</strong> Moves your business forward</li>
                </ul>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Outcome
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {outcomes.map((outcome: Outcome) => (
                <div
                  key={outcome.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${outcome.completed ? "line-through text-muted-foreground" : ""}`}>
                        {outcome.title}
                      </p>
                      <StatusBadge status={outcome.status === "Done" ? "COMPLETED" : outcome.status === "Missed" ? "MISSED" : "PENDING"} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Week of {formatDate(outcome.weekStartDate)}
                    </p>
                  </div>
                  <Button
                    variant={outcome.completed ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleMutation.mutate(outcome)}
                    disabled={toggleMutation.isPending}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : outcome.completed ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Undo
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

