import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMetrics,
  useMetricLogs,
  useCreateMetric,
  useUpdateMetric,
  useDeleteMetric,
  useLogMetric,
  type Metric,
  type MetricLog,
} from "@/hooks/useMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Plus,
  MoreHorizontal,
  History,
  Pencil,
  Trash2,
  BarChart3,
  Info,
} from "lucide-react";

// ============================================
// Form Schemas
// ============================================
const createMetricSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  target: z.coerce.number().min(0, "Target must be 0 or greater").optional(),
});

const logValueSchema = z.object({
  value: z.coerce.number({
    required_error: "Value is required",
    invalid_type_error: "Value must be a number",
  }),
});

type CreateMetricFormData = z.infer<typeof createMetricSchema>;
type LogValueFormData = z.infer<typeof logValueSchema>;

// ============================================
// Trend Calculation Helper
// ============================================
function getTrend(logs: MetricLog[]): "up" | "down" | "neutral" {
  if (!logs || logs.length < 2) return "neutral";

  // Sort by date descending to get the two most recent logs
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sortedLogs[0].value;
  const previous = sortedLogs[1].value;

  if (latest > previous) return "up";
  if (latest < previous) return "down";
  return "neutral";
}

function TrendIndicator({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") {
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  }
  if (trend === "down") {
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

// ============================================
// Create Metric Dialog
// ============================================
function CreateMetricDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMetric = useCreateMetric();

  const form = useForm<CreateMetricFormData>({
    resolver: zodResolver(createMetricSchema),
    defaultValues: {
      name: "",
      target: undefined,
    },
  });

  const onSubmit = async (data: CreateMetricFormData) => {
    await createMetric.mutateAsync({
      name: data.name,
      target: data.target,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Metric</DialogTitle>
          <DialogDescription>
            Create a metric to track a number over time. Examples: Sales Revenue, Leads Generated, Conversion Rate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly Sales Revenue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100000"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMetric.isPending}>
                {createMetric.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Add Metric
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Metric Dialog
// ============================================
function EditMetricDialog({
  metric,
  open,
  onOpenChange,
}: {
  metric: Metric;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMetric = useUpdateMetric();

  const form = useForm<CreateMetricFormData>({
    resolver: zodResolver(createMetricSchema),
    defaultValues: {
      name: metric.name,
      target: metric.target,
    },
  });

  const onSubmit = async (data: CreateMetricFormData) => {
    await updateMetric.mutateAsync({
      metricId: metric.id,
      payload: {
        name: data.name,
        target: data.target,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Metric</DialogTitle>
          <DialogDescription>
            Update the metric name or target value.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly Sales Revenue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100000"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMetric.isPending}>
                {updateMetric.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Metric Detail Dialog (View Logs)
// ============================================
function MetricDetailDialog({
  metric,
  open,
  onOpenChange,
}: {
  metric: Metric;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: logs, isLoading: logsLoading } = useMetricLogs(metric.id);
  const logMetric = useLogMetric();

  const form = useForm<LogValueFormData>({
    resolver: zodResolver(logValueSchema),
    defaultValues: {
      value: undefined,
    },
  });

  const onSubmit = async (data: LogValueFormData) => {
    await logMetric.mutateAsync({
      metricId: metric.id,
      value: data.value,
    });
    form.reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  const sortedLogs = logs
    ? [...(logs as MetricLog[])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {metric.name}
          </DialogTitle>
          <DialogDescription>
            {metric.target
              ? `Target: ${formatValue(metric.target)}`
              : "No target set"}
          </DialogDescription>
        </DialogHeader>

        {/* Log New Value Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log New Value</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-end gap-3"
              >
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter value"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={logMetric.isPending}>
                  {logMetric.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Log Value
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Log History */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Log History
          </h4>

          {logsLoading ? (
            <TableSkeleton columns={2} rows={5} />
          ) : sortedLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No logs recorded yet</p>
              <p className="text-sm">Use the form above to log your first value.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatValue(log.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Delete Confirmation Dialog
// ============================================
function DeleteMetricDialog({
  metric,
  open,
  onOpenChange,
}: {
  metric: Metric;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMetric = useDeleteMetric();

  const handleDelete = async () => {
    await deleteMetric.mutateAsync(metric.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Metric</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{metric.name}"? This will also delete
            all log history. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMetric.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// Metric Row Component
// ============================================
function MetricRow({
  metric,
  logs,
}: {
  metric: Metric;
  logs: MetricLog[] | undefined;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sortedLogs = logs
    ? [...logs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const lastValue = sortedLogs.length > 0 ? sortedLogs[0].value : null;
  const trend = getTrend(sortedLogs);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailOpen(true)}>
        <TableCell className="font-medium">{metric.name}</TableCell>
        <TableCell>
          {metric.target ? (
            <Badge variant="secondary">{formatValue(metric.target)}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {lastValue !== null ? (
            <span className="font-medium">{formatValue(lastValue)}</span>
          ) : (
            <span className="text-muted-foreground italic">Not recorded yet</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <TrendIndicator trend={trend} />
          </div>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                <History className="h-4 w-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <MetricDetailDialog
        metric={metric}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <EditMetricDialog
        metric={metric}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteMetricDialog
        metric={metric}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

// Wrapper component that fetches logs for each metric
function MetricRowWithLogs({ metric }: { metric: Metric }) {
  const { data: logs } = useMetricLogs(metric.id);
  return <MetricRow metric={metric} logs={logs as MetricLog[] | undefined} />;
}

// ============================================
// Main Metrics Page Component
// ============================================
export default function Metrics() {
  const { data: metrics, isLoading, isError } = useMetrics();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const normalizedMetrics: Metric[] = Array.isArray(metrics) ? metrics : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <TableSkeleton columns={5} rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Metrics"
          description="Choose the numbers you want to track regularly over time."
        />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Target}
              title="Failed to load metrics"
              description="There was an error loading your metrics. Please try again."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Metrics"
          description="Choose the numbers you want to track regularly over time."
        />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </div>

      {/* Metrics Table or Empty State */}
      <Card>
        <CardContent className="pt-6">
          {normalizedMetrics.length === 0 ? (
            <div className="py-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Track What Matters</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Metrics are daily or weekly numbers you want to monitor. Examples:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Sales Calls (10/day)</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">Revenue (₹50K/week)</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">New Leads (5/day)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Metric
                </Button>
                <Button variant="outline" asChild>
                  <a href="/templates">Browse Templates →</a>
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric Name</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Last Recorded</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normalizedMetrics.map((metric) => (
                  <MetricRowWithLogs key={metric.id} metric={metric} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Helper Text */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Metrics define what the system measures. Activities and outcomes influence these numbers.
        </p>
      </div>

      {/* Create Metric Dialog */}
      <CreateMetricDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
