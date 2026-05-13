import { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  CheckCircle2,
  Edit,
  FilterX,
  Flame,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CoachActionLane,
  CoachResultCard,
  InteractiveCoachHero,
} from "@/components/InteractiveCoach";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSalesProspect,
  useDeleteSalesProspect,
  useSalesProspectSummary,
  useSalesProspects,
  useUpdateSalesProspect,
} from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyINR } from "@/lib/utils";
import type {
  SalesProspect,
  SalesProspectReason,
  SalesProspectStatus,
} from "@/lib/api";

const statuses: SalesProspectStatus[] = [
  "COLD",
  "WARM",
  "HOT",
  "CONVERTED",
  "REJECTED",
];
const reasons: SalesProspectReason[] = [
  "BUDGET",
  "AUTHORITY",
  "NEED",
  "TIMELINE",
  "AVAILABILITY",
  "CLOSURE",
  "OTHER",
];

const statusLabels: Record<SalesProspectStatus, string> = {
  COLD: "Cold",
  WARM: "Warm",
  HOT: "Hot",
  CONVERTED: "Converted",
  REJECTED: "Rejected",
};

const activeStatuses = new Set<SalesProspectStatus>(["COLD", "WARM", "HOT"]);

const reasonLabels: Record<SalesProspectReason, string> = {
  BUDGET: "Budget",
  AUTHORITY: "Authority",
  NEED: "Need",
  TIMELINE: "Timeline",
  AVAILABILITY: "Availability",
  CLOSURE: "Closure",
  OTHER: "Other",
};

const formSchema = z.object({
  month: z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/, "Select a valid month"),
  firstCallAt: z.string().optional(),
  prospectName: z
    .string()
    .min(2, "Prospect name must be at least 2 characters"),
  mobileNumber: z.string().optional(),
  offeringType: z.string().optional(),
  proposalValue: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null
        ? undefined
        : Number(value),
    z.number().min(0, "Proposal value must be 0 or greater").optional(),
  ),
  referralSource: z.string().optional(),
  lastFollowUpAt: z.string().optional(),
  status: z.enum(["COLD", "WARM", "HOT", "CONVERTED", "REJECTED"]),
  reason: z.enum([
    "NONE",
    "BUDGET",
    "AUTHORITY",
    "NEED",
    "TIMELINE",
    "AVAILABILITY",
    "CLOSURE",
    "OTHER",
  ]),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type ReasonFilter = SalesProspectReason | "ALL";

const currentMonth = new Date().toISOString().slice(0, 7);

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayInput() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getDaysSince(value: string | null) {
  if (!value) return null;
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

function formatPercentValue(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function cleanText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getStatusVariant(
  status: SalesProspectStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "CONVERTED") return "default";
  if (status === "REJECTED") return "destructive";
  if (status === "HOT") return "secondary";
  return "outline";
}

function getFollowUpSignal(prospect: SalesProspect) {
  if (!activeStatuses.has(prospect.status)) {
    return { label: "Closed", variant: "secondary" as const };
  }

  const daysSince = getDaysSince(prospect.lastFollowUpAt);
  if (daysSince === null) {
    return { label: "Needs follow-up", variant: "destructive" as const };
  }

  if (daysSince > 7) {
    return { label: "Follow-up overdue", variant: "destructive" as const };
  }

  return {
    label: `Followed ${formatDate(prospect.lastFollowUpAt)}`,
    variant: "outline" as const,
  };
}

function toPayload(values: FormValues) {
  return {
    month: values.month,
    firstCallAt: cleanText(values.firstCallAt),
    prospectName: values.prospectName.trim(),
    mobileNumber: cleanText(values.mobileNumber),
    offeringType: cleanText(values.offeringType),
    proposalValue: values.proposalValue,
    referralSource: cleanText(values.referralSource),
    lastFollowUpAt: cleanText(values.lastFollowUpAt),
    status: values.status,
    reason: values.reason === "NONE" ? undefined : values.reason,
    remarks: cleanText(values.remarks),
  };
}

function getDefaultValues(month: string): FormValues {
  return {
    month,
    firstCallAt: "",
    prospectName: "",
    mobileNumber: "",
    offeringType: "",
    proposalValue: undefined,
    referralSource: "",
    lastFollowUpAt: "",
    status: "COLD",
    reason: "NONE",
    remarks: "",
  };
}

export function SalesProspectsPanel() {
  const { toast } = useToast();
  const [month, setMonth] = useState(currentMonth);
  const [status, setStatus] = useState<SalesProspectStatus | "ALL">("ALL");
  const [reason, setReason] = useState<ReasonFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SalesProspect | null>(null);
  const [saveResult, setSaveResult] = useState<{
    name: string;
    status: SalesProspectStatus;
    value?: number;
  } | null>(null);

  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      month,
      status: status === "ALL" ? undefined : status,
      reason: reason === "ALL" ? undefined : reason,
      search: cleanText(search),
    }),
    [month, page, reason, search, status],
  );

  const prospects = useSalesProspects(params);
  const summary = useSalesProspectSummary(month);
  const createMutation = useCreateSalesProspect();
  const updateMutation = useUpdateSalesProspect();
  const deleteMutation = useDeleteSalesProspect();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(month),
  });

  const rows = prospects.data?.data ?? [];
  const totalPages = prospects.data?.totalPages ?? 1;
  const stats = summary.data;
  const activeFollowUps =
    stats?.activeFollowUps ??
    (stats?.byStatus?.WARM ?? 0) + (stats?.byStatus?.HOT ?? 0);
  const statusCounts = stats?.byStatus ?? {};
  const totalProspects = stats?.totalProspects ?? 0;
  const conversionRate =
    totalProspects > 0
      ? ((stats?.convertedCount ?? 0) / totalProspects) * 100
      : 0;
  const followUpCoverage =
    totalProspects > 0 ? (activeFollowUps / totalProspects) * 100 : 0;
  const visibleNeedsAttention = rows.filter((row) => {
    if (!activeStatuses.has(row.status)) return false;
    const daysSince = getDaysSince(row.lastFollowUpAt);
    return daysSince === null || daysSince > 7;
  }).length;
  const hasActiveFilters =
    status !== "ALL" ||
    reason !== "ALL" ||
    search.trim().length > 0 ||
    month !== currentMonth;

  function updateMonth(value: string) {
    setMonth(value);
    setPage(1);
  }

  function updateStatus(value: SalesProspectStatus | "ALL") {
    setStatus(value);
    setPage(1);
  }

  function updateReason(value: ReasonFilter) {
    setReason(value);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function resetFilters() {
    setMonth(currentMonth);
    setStatus("ALL");
    setReason("ALL");
    setSearch("");
    setPage(1);
  }

  function startCreate() {
    setEditing(null);
    form.reset(getDefaultValues(month));
    setOpen(true);
  }

  function startCreatePreset(
    preset: Pick<
      FormValues,
      "offeringType" | "proposalValue" | "status" | "lastFollowUpAt" | "remarks"
    >,
  ) {
    setEditing(null);
    form.reset({
      ...getDefaultValues(month),
      ...preset,
    });
    setOpen(true);
  }

  function startEdit(prospect: SalesProspect) {
    setEditing(prospect);
    form.reset({
      month: prospect.month,
      firstCallAt: toDateInput(prospect.firstCallAt),
      prospectName: prospect.prospectName,
      mobileNumber: prospect.mobileNumber ?? "",
      offeringType: prospect.offeringType ?? "",
      proposalValue: prospect.proposalValue ?? undefined,
      referralSource: prospect.referralSource ?? "",
      lastFollowUpAt: toDateInput(prospect.lastFollowUpAt),
      status: prospect.status,
      reason: prospect.reason ?? "NONE",
      remarks: prospect.remarks ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: toPayload(values),
        });
        toast({ title: "Prospect updated" });
      } else {
        await createMutation.mutateAsync(toPayload(values));
        toast({ title: "Prospect added" });
      }
      setSaveResult({
        name: values.prospectName.trim(),
        status: values.status,
        value: values.proposalValue,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Unable to save prospect",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function removeProspect(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Prospect deleted" });
    } catch (error) {
      toast({
        title: "Unable to delete prospect",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }

  const quickUpdate = useCallback(
    async (
      prospect: SalesProspect,
      payload: Partial<ReturnType<typeof toPayload>>,
      successTitle: string,
    ) => {
      try {
        await updateMutation.mutateAsync({ id: prospect.id, payload });
        toast({ title: successTitle });
      } catch (error) {
        toast({
          title: "Unable to update prospect",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast, updateMutation],
  );

  return (
    <div className="flex flex-col gap-4">
      <InteractiveCoachHero
        actionLabel={
          totalProspects > 0 ? "Add next prospect" : "Start pipeline"
        }
        icon={Users}
        metricLabel="Active follow-ups"
        metricValue={activeFollowUps}
        onAction={() =>
          startCreatePreset({
            lastFollowUpAt: getTodayInput(),
            offeringType: "Discovery conversation",
            proposalValue: undefined,
            remarks: "Next step: first useful follow-up.",
            status: "WARM",
          })
        }
        progress={followUpCoverage}
        steps={[
          {
            label: "Name the relationship",
            helper: "Capture who can move the business forward.",
          },
          {
            label: "Set the next touch",
            helper: "Warm and hot records should never sit still.",
          },
          {
            label: "Update status",
            helper: "The coach reacts when prospects move.",
          },
        ]}
        title={
          totalProspects > 0
            ? "Move the next relationship"
            : "Build the pipeline base"
        }
      >
        CRM should feel like a next-action board. Add the relationship, mark
        today's touch, then keep the funnel status honest.
      </InteractiveCoachHero>

      {saveResult ? (
        <CoachResultCard
          actions={[
            {
              label: "Add another prospect",
              onClick: () =>
                startCreatePreset({
                  lastFollowUpAt: getTodayInput(),
                  offeringType: "Discovery conversation",
                  proposalValue: undefined,
                  remarks: "Next step: first useful follow-up.",
                  status: "WARM",
                }),
              variant: "default",
            },
            { label: "Open Today", to: "/today" },
          ]}
          metrics={[
            { label: "Status", value: statusLabels[saveResult.status] },
            {
              label: "Value",
              value: formatCurrencyINR(saveResult.value ?? 0),
            },
          ]}
          title={`${saveResult.name} saved. Now create movement.`}
        >
          Use the quick actions in the table to mark today's follow-up, warm,
          hot, or won so the dashboard and mobile coach stay current.
        </CoachResultCard>
      ) : null}

      <CoachActionLane
        title="CRM smart starts"
        items={[
          {
            label: "Warm lead",
            value: statusCounts.WARM ?? 0,
            helper: "Someone interested enough for a next touch.",
            icon: Flame,
          },
          {
            label: "Hot deal",
            value: statusCounts.HOT ?? 0,
            helper: "Proposal or decision stage opportunity.",
            icon: CheckCircle2,
          },
          {
            label: "Needs attention",
            value: visibleNeedsAttention,
            helper: "Records missing a recent follow-up.",
            icon: CalendarClock,
          },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-[160px_180px_180px_minmax(220px,1fr)]">
          <Input
            type="month"
            value={month}
            onChange={(event) => updateMonth(event.target.value)}
          />
          <Select
            value={status}
            onValueChange={(value) =>
              updateStatus(value as SalesProspectStatus | "ALL")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {statusLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={reason}
            onValueChange={(value) => updateReason(value as ReasonFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All reasons</SelectItem>
              {reasons.map((item) => (
                <SelectItem key={item} value={item}>
                  {reasonLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search name, mobile, product, referral"
              className="pl-9"
            />
          </div>
        </div>
        <Button onClick={startCreate} className="lg:self-stretch">
          <Plus className="mr-2 size-4" />
          Add prospect
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <FilterX className="mr-2 size-4" />
            Reset filters
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total prospects"
          value={stats?.totalProspects ?? 0}
          loading={summary.isLoading}
        />
        <SummaryCard
          title="Pipeline value"
          value={formatCurrencyINR(stats?.pipelineValue ?? 0)}
          loading={summary.isLoading}
        />
        <SummaryCard
          title="Converted value"
          value={formatCurrencyINR(stats?.convertedValue ?? 0)}
          caption={`${stats?.convertedCount ?? 0} converted`}
          loading={summary.isLoading}
        />
        <SummaryCard
          title="Active follow-ups"
          value={activeFollowUps}
          loading={summary.isLoading}
        />
        <SummaryCard
          title="Rejected"
          value={stats?.rejectedCount ?? 0}
          loading={summary.isLoading}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Funnel board
            </CardTitle>
            <CardDescription>
              Click a status to filter this month's pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-5">
            {statuses.map((item) => (
              <Button
                key={item}
                type="button"
                variant={status === item ? "default" : "outline"}
                className="h-auto flex-col items-start gap-1 px-3 py-3"
                onClick={() => updateStatus(status === item ? "ALL" : item)}
              >
                <span className="text-xs font-medium">
                  {statusLabels[item]}
                </span>
                <span className="text-xl font-semibold">
                  {statusCounts[item] ?? 0}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">CRM health</CardTitle>
            <CardDescription>
              Conversion and follow-up signals for the selected month.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HealthMetric
              label="Conversion rate"
              value={formatPercentValue(conversionRate)}
            />
            <HealthMetric
              label="Warm/hot follow-ups"
              value={formatPercentValue(followUpCoverage)}
            />
            <HealthMetric
              label="Visible needs attention"
              value={visibleNeedsAttention}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-medium">
                Sales Cycle Prospects
              </CardTitle>
              <CardDescription>
                {prospects.data?.total ?? 0} record
                {(prospects.data?.total ?? 0) === 1 ? "" : "s"} in this view
              </CardDescription>
            </div>
            {prospects.isFetching && !prospects.isLoading && (
              <Badge variant="outline">
                <Loader2 className="mr-1 size-3 animate-spin" />
                Refreshing
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {prospects.isLoading ? (
            <ProspectTableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No prospects found"
              description="Add a prospect or adjust the filters to build this month's sales cycle."
              action={startCreate}
              actionLabel="Add prospect"
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>First call</TableHead>
                      <TableHead>Prospect name</TableHead>
                      <TableHead>Mobile number</TableHead>
                      <TableHead>Product/service type</TableHead>
                      <TableHead className="text-right">
                        Proposal value
                      </TableHead>
                      <TableHead>Referral source</TableHead>
                      <TableHead>Last follow-up</TableHead>
                      <TableHead>Next action</TableHead>
                      <TableHead>Funnel status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap">
                          {row.month}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(row.firstCallAt)}
                        </TableCell>
                        <TableCell className="min-w-44 font-medium">
                          {row.prospectName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.mobileNumber || "-"}
                        </TableCell>
                        <TableCell className="min-w-44">
                          {row.offeringType || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyINR(row.proposalValue ?? 0)}
                        </TableCell>
                        <TableCell className="min-w-36">
                          {row.referralSource || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(row.lastFollowUpAt)}
                        </TableCell>
                        <TableCell className="min-w-44">
                          <Badge variant={getFollowUpSignal(row).variant}>
                            {getFollowUpSignal(row).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(row.status)}>
                            {statusLabels[row.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.reason ? reasonLabels[row.reason] : "-"}
                        </TableCell>
                        <TableCell className="max-w-72 truncate">
                          {row.remarks || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex min-w-72 flex-wrap justify-end gap-1">
                            {activeStatuses.has(row.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  quickUpdate(
                                    row,
                                    { lastFollowUpAt: getTodayInput() },
                                    `${row.prospectName} follow-up updated`,
                                  )
                                }
                                disabled={updateMutation.isPending}
                              >
                                <CalendarClock className="mr-1 size-3.5" />
                                Today
                              </Button>
                            )}
                            {row.status === "COLD" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  quickUpdate(
                                    row,
                                    { status: "WARM" },
                                    `${row.prospectName} marked warm`,
                                  )
                                }
                                disabled={updateMutation.isPending}
                              >
                                <Flame className="mr-1 size-3.5" />
                                Warm
                              </Button>
                            )}
                            {(row.status === "COLD" ||
                              row.status === "WARM") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  quickUpdate(
                                    row,
                                    { status: "HOT" },
                                    `${row.prospectName} marked hot`,
                                  )
                                }
                                disabled={updateMutation.isPending}
                              >
                                <Flame className="mr-1 size-3.5" />
                                Hot
                              </Button>
                            )}
                            {row.status === "HOT" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  quickUpdate(
                                    row,
                                    { status: "CONVERTED" },
                                    `${row.prospectName} marked converted`,
                                  )
                                }
                                disabled={updateMutation.isPending}
                              >
                                <CheckCircle2 className="mr-1 size-3.5" />
                                Won
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(row)}
                            >
                              <Edit className="size-4" />
                              <span className="sr-only">
                                Edit {row.prospectName}
                              </span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="size-4" />
                                  <span className="sr-only">
                                    Delete {row.prospectName}
                                  </span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete prospect?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This removes {row.prospectName} from the
                                    sales cycle tracker.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeProspect(row.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {prospects.data?.page ?? page} of{" "}
                  {Math.max(totalPages, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((value) => value + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit prospect" : "Add prospect"}
            </DialogTitle>
            <DialogDescription>
              Capture the Sales Cycle fields from first call through closure
              reason.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstCallAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First call</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prospectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prospect name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Industries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="offeringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product/service type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sales excellence workshop"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proposalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="150000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referralSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral source</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Referral, LinkedIn, event"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastFollowUpAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last follow-up</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funnel status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((item) => (
                          <SelectItem key={item} value={item}>
                            {statusLabels[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">No reason</SelectItem>
                        {reasons.map((item) => (
                          <SelectItem key={item} value={item}>
                            {reasonLabels[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Follow-up notes, next step, blocker"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {editing ? "Save prospect" : "Add prospect"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  caption,
  loading,
}: {
  title: string;
  value: string | number;
  caption?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <p className="text-2xl font-semibold">{value}</p>
            {caption && (
              <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HealthMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ProspectTableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
