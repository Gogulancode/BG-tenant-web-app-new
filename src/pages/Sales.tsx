import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSalesPlanning,
  updateSalesPlanning,
  getSalesTracker,
  createSalesEntry,
  logWeeklySales,
  getWeeklySalesEntry,
  getWeeklySalesEntries,
  type WeeklySalesEntryResponse,
} from "../lib/api";
import { useSalesSummary, useWeeklyTargets, useSalesWeeklySummary } from "@/hooks/useSales";
import { useWeeklyActivitySummary } from "@/hooks/useActivities";
import { useWeeklyOutcomesSummary } from "@/hooks/useOutcomes";
import { formatCurrencyINR, formatPercent, clamp, getCurrentWeekNumber } from "@/lib/utils";
import {
  SalesProspectsPanel,
  SalesTrendChart,
  WeekRangePicker,
  WeeklySummaryTable,
  exportWeeklySummaryToCSV,
  type WeekRangeOption,
} from "@/components/sales";
import { WeeklyActivitySummary } from "@/components/activities";
import { WeeklyOutcomesSummary } from "@/components/outcomes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton, CardSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, Target, Loader2, AlertTriangle, Calendar, Percent, RefreshCw, Download, BarChart3, CheckCircle, XCircle, PlusCircle, HelpCircle, ChevronLeft, ChevronRight, History } from "lucide-react";

type SalesPlan = {
  weeklyRevenueTarget: number;
  targetDeals: number;
  pipelineCoverage: number;
};

type SalesDeal = {
  id: string;
  name: string;
  stage: string;
  value: number;
  expectedCloseDate: string;
};

const stages = ["Lead", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

const salesPlanSchema = z.object({
  weeklyRevenueTarget: z.coerce.number().min(0, "Must be 0 or greater"),
  targetDeals: z.coerce.number().int().min(0, "Must be 0 or greater"),
  pipelineCoverage: z.coerce.number().min(0, "Must be 0 or greater"),
});

const dealSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  stage: z.string().min(1, "Please select a stage"),
  value: z.coerce.number().min(0, "Must be 0 or greater"),
  expectedCloseDate: z.string().min(1, "Please select a date"),
});

type SalesPlanFormData = z.infer<typeof salesPlanSchema>;
type DealFormData = z.infer<typeof dealSchema>;

// Weekly sales entry schema
const weeklySalesSchema = z.object({
  achieved: z.coerce.number().min(0, "Must be 0 or greater"),
  orders: z.coerce.number().int().min(0, "Must be 0 or greater").optional(),
  notes: z.string().optional(),
});

type WeeklySalesFormData = z.infer<typeof weeklySalesSchema>;

// Helper to get week date range
function getWeekDateRange(year: number, week: number): { start: Date; end: Date } {
  const jan1 = new Date(year, 0, 1);
  const daysToAdd = (week - 1) * 7 - jan1.getDay();
  const start = new Date(jan1);
  start.setDate(jan1.getDate() + daysToAdd);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatWeekRange(year: number, week: number): string {
  const { start, end } = getWeekDateRange(year, week);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-IN', opts)} - ${end.toLocaleDateString('en-IN', opts)}`;
}

// ============================================
// Log Weekly Sales Component (Improved)
// ============================================
function LogWeeklySalesSection() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const currentWeek = getCurrentWeekNumber();
  
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [weeklyEntry, setWeeklyEntry] = useState<WeeklySalesEntryResponse | null>(null);
  const [allEntries, setAllEntries] = useState<WeeklySalesEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(false); // Separate loading for week navigation
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");

  const form = useForm<WeeklySalesFormData>({
    resolver: zodResolver(weeklySalesSchema),
    defaultValues: {
      achieved: 0,
      orders: 0,
      notes: "",
    },
  });

  // Load all entries on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [entry, entries] = await Promise.all([
          getWeeklySalesEntry(currentYear, currentWeek),
          getWeeklySalesEntries(currentYear),
        ]);
        setWeeklyEntry(entry);
        setAllEntries(entries.sort((a, b) => b.week - a.week));
        
        if (entry && entry.achieved > 0) {
          form.reset({
            achieved: entry.achieved,
            orders: entry.orders || 0,
            notes: entry.notes || "",
          });
        }
      } catch (error) {
        console.error("Failed to load weekly entries:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [currentYear]); // Only run on mount

  // Load selected week's entry when week changes
  useEffect(() => {
    if (loading) return; // Skip during initial load
    
    async function loadWeekData() {
      setWeekLoading(true);
      try {
        const entry = await getWeeklySalesEntry(currentYear, selectedWeek);
        setWeeklyEntry(entry);
        
        if (entry && entry.achieved > 0) {
          form.reset({
            achieved: entry.achieved,
            orders: entry.orders || 0,
            notes: entry.notes || "",
          });
        } else {
          form.reset({ achieved: 0, orders: 0, notes: "" });
        }
      } catch (error) {
        console.error("Failed to load week entry:", error);
      } finally {
        setWeekLoading(false);
      }
    }
    loadWeekData();
  }, [selectedWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: WeeklySalesFormData) {
    setSubmitting(true);
    try {
      await logWeeklySales({
        year: currentYear,
        week: selectedWeek,
        achieved: data.achieved,
        orders: data.orders,
        notes: data.notes,
      });
      
      // Refresh all data
      const [updatedEntry, entries] = await Promise.all([
        getWeeklySalesEntry(currentYear, selectedWeek),
        getWeeklySalesEntries(currentYear),
      ]);
      setWeeklyEntry(updatedEntry);
      setAllEntries(entries.sort((a, b) => b.week - a.week));
      
      toast({
        title: `Week ${selectedWeek} Sales ${weeklyEntry?.achieved ? "Updated" : "Logged"}!`,
        description: updatedEntry.status === "exceeded" 
          ? "🎉 Target exceeded!"
          : updatedEntry.status === "achieved"
          ? "✅ On track!"
          : `📊 ${updatedEntry.achievementPercent.toFixed(0)}% achieved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log weekly sales",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    } else if (direction === "next" && selectedWeek < currentWeek) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (entry: WeeklySalesEntryResponse | null) => {
    if (!entry || entry.achieved === 0) return null;
    
    switch (entry.status) {
      case "exceeded":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {entry.achievementPercent.toFixed(0)}%
          </Badge>
        );
      case "achieved":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {entry.achievementPercent.toFixed(0)}%
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-400">
            {entry.achievementPercent.toFixed(0)}%
          </Badge>
        );
    }
  };

  // Get logged weeks count
  const loggedWeeksCount = allEntries.filter(e => e.achieved > 0).length;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Weekly Sales Tracker
            </CardTitle>
            <CardDescription className="mt-1">
              Log your sales revenue each week to track progress against targets
            </CardDescription>
          </div>
          {loggedWeeksCount > 0 && (
            <Badge variant="secondary">
              {loggedWeeksCount} week{loggedWeeksCount !== 1 ? "s" : ""} logged
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "log" | "history")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="log" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Log Sales
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History ({loggedWeeksCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4">
            {/* Week Selector */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek("prev")}
                disabled={selectedWeek <= 1 || weekLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center min-w-[180px]">
                {weekLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Week {selectedWeek}</span>
                      {selectedWeek === currentWeek && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatWeekRange(currentYear, selectedWeek)}
                    </p>
                  </>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek("next")}
                disabled={selectedWeek >= currentWeek || weekLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Target vs Achievement Display */}
            {!weekLoading && weeklyEntry && weeklyEntry.target > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Weekly Target</p>
                    <p className="text-xl font-bold">{formatCurrencyINR(weeklyEntry.target)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Achieved</p>
                    <p className="text-xl font-bold">
                      {weeklyEntry.achieved > 0 ? formatCurrencyINR(weeklyEntry.achieved) : "—"}
                    </p>
                  </div>
                </div>
                {weeklyEntry.achieved > 0 && (
                  <>
                    <Progress 
                      value={clamp(weeklyEntry.achievementPercent, 0, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {weeklyEntry.achievementPercent.toFixed(1)}% of target
                      </span>
                      {getStatusBadge(weeklyEntry)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Entry Form */}
            {!weekLoading && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="achieved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Revenue (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="e.g., 150000" 
                          {...field} 
                          disabled={weekLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Total revenue closed/collected this week
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orders"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Number of Deals/Orders</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Deals vs Outcomes</p>
                              <p className="text-sm">
                                <strong>Deals/Orders:</strong> Count of sales transactions closed (invoices, orders).<br/><br/>
                                <strong>Outcomes:</strong> Weekly goals you commit to (e.g., "Close 3 deals", "Launch campaign").
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      </div>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0" 
                          placeholder="e.g., 5" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        How many individual deals or orders did you close?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes <Badge variant="outline" className="text-xs ml-1">Optional</Badge></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Closed ABC Corp deal, 2 renewals" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={submitting || weekLoading} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {weeklyEntry && weeklyEntry.achieved > 0 
                    ? `Update Week ${selectedWeek} Sales` 
                    : `Log Week ${selectedWeek} Sales`}
                </Button>
              </form>
            </Form>
            )}
          </TabsContent>

          <TabsContent value="history">
            {allEntries.filter(e => e.achieved > 0).length === 0 ? (
              <EmptyState
                icon={History}
                title="No sales logged yet"
                description="Start logging your weekly sales to see history here"
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Achieved</TableHead>
                      <TableHead className="text-right">%</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEntries.filter(e => e.achieved > 0).map((entry) => (
                      <TableRow key={entry.week}>
                        <TableCell className="font-medium">
                          Week {entry.week}
                          {entry.week === currentWeek && (
                            <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatWeekRange(entry.year, entry.week)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyINR(entry.target)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrencyINR(entry.achieved)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(entry)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWeek(entry.week);
                              setActiveTab("log");
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================
// Weekly Targets Section Component
// ============================================
function WeeklyTargetsSection() {
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useSalesSummary();
  const { data: weeklyTargets, isLoading: targetsLoading } = useWeeklyTargets();

  const targets = summary?.targets;
  const hasSalesPlan = targets && targets.monthlyTarget > 0;

  // Get next 6 weeks from current week
  const upcomingWeeks = useMemo(() => {
    if (!weeklyTargets || weeklyTargets.length === 0) return [];
    const currentWeek = summary?.targets ? Math.max(1, new Date().getMonth() + 1) : 1;
    // Find current week index (1-based week number in year)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekOfYear = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    const startIdx = Math.min(weekOfYear - 1, weeklyTargets.length - 6);
    return weeklyTargets.slice(Math.max(0, startIdx), startIdx + 6);
  }, [weeklyTargets, summary]);

  if (summaryLoading || targetsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (summaryError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load sales targets. Please try again.</AlertDescription>
      </Alert>
    );
  }

  // Show onboarding CTA if no sales plan
  if (!hasSalesPlan) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sales Plan Not Set</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>Complete the onboarding Sales Planning step to generate weekly and monthly targets.</span>
          <Button asChild size="sm" className="w-fit">
            <Link to="/onboarding">Go to Onboarding</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const progressValue = clamp(targets?.weeklyAchievementPercent ?? 0, 0, 100);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Target Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              Weekly Target
            </div>
            <p className="text-2xl font-bold">
              {formatCurrencyINR(targets?.weeklyTarget ?? 0)}
            </p>
          </CardContent>
        </Card>

        {/* Achieved This Week Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Achieved This Week
            </div>
            <p className="text-2xl font-bold">
              {formatCurrencyINR(targets?.achievedThisWeek ?? 0)}
            </p>
          </CardContent>
        </Card>

        {/* Achievement % Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Percent className="h-4 w-4" />
              Achievement
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {formatPercent(targets?.weeklyAchievementPercent ?? 0)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {targets?.daysRemainingInWeek ?? 0} days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium">
              {formatCurrencyINR(targets?.achievedThisWeek ?? 0)} / {formatCurrencyINR(targets?.weeklyTarget ?? 0)}
            </span>
          </div>
          <Progress value={progressValue} className="h-3" />
        </CardContent>
      </Card>

      {/* Upcoming Weeks Breakdown */}
      {upcomingWeeks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales Targets (Auto-calculated)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Derived automatically from your monthly sales plan
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingWeeks.map((week) => (
                  <TableRow key={week.weekNumber}>
                    <TableCell className="font-medium">Week {week.weekNumber}</TableCell>
                    <TableCell>{week.monthName}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyINR(week.weeklyTarget)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Sales() {
  const [plan, setPlan] = useState<SalesPlan | null>(null);
  const [deals, setDeals] = useState<SalesDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Weekly Trend state
  const [weekRangeOption, setWeekRangeOption] = useState<WeekRangeOption>("last6");
  const [customFromWeek, setCustomFromWeek] = useState(1);
  const [customToWeek, setCustomToWeek] = useState(getCurrentWeekNumber());

  // Compute week range based on selection
  const { fromWeek, toWeek, year } = useMemo(() => {
    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    
    switch (weekRangeOption) {
      case "last4":
        return { fromWeek: Math.max(1, currentWeek - 3), toWeek: currentWeek, year: currentYear };
      case "last6":
        return { fromWeek: Math.max(1, currentWeek - 5), toWeek: currentWeek, year: currentYear };
      case "last12":
        return { fromWeek: Math.max(1, currentWeek - 11), toWeek: currentWeek, year: currentYear };
      case "custom":
        return { fromWeek: customFromWeek, toWeek: customToWeek, year: currentYear };
      default:
        return { fromWeek: Math.max(1, currentWeek - 5), toWeek: currentWeek, year: currentYear };
    }
  }, [weekRangeOption, customFromWeek, customToWeek]);

  // Weekly summary query
  const { 
    data: weeklySummary, 
    isLoading: weeklySummaryLoading, 
    refetch: refetchWeeklySummary 
  } = useSalesWeeklySummary({ year, fromWeek, toWeek });

  // Weekly activity summary (current week only)
  const currentWeekForActivity = getCurrentWeekNumber();
  const {
    data: activitySummary,
    isLoading: activitySummaryLoading,
    isError: activitySummaryError,
    refetch: refetchActivitySummary,
  } = useWeeklyActivitySummary({ week: currentWeekForActivity });

  // Weekly outcomes summary (current week only)
  const {
    data: outcomesSummary,
    isLoading: outcomesSummaryLoading,
    isError: outcomesSummaryError,
    refetch: refetchOutcomesSummary,
  } = useWeeklyOutcomesSummary({ week: currentWeekForActivity });

  const planForm = useForm<SalesPlanFormData>({
    resolver: zodResolver(salesPlanSchema),
    defaultValues: {
      weeklyRevenueTarget: 0,
      targetDeals: 0,
      pipelineCoverage: 0,
    },
  });

  const dealForm = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: "",
      stage: "Lead",
      value: 0,
      expectedCloseDate: "",
    },
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [planning, tracker] = await Promise.all([
          getSalesPlanning(),
          getSalesTracker(),
        ]);

        setPlan(planning);
        setDeals(Array.isArray(tracker) ? tracker : []);

        if (planning) {
          planForm.reset({
            weeklyRevenueTarget: planning.weeklyRevenueTarget ?? 0,
            targetDeals: planning.targetDeals ?? 0,
            pipelineCoverage: planning.pipelineCoverage ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to load sales data:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function onSavePlan(data: SalesPlanFormData) {
    try {
      const payload = {
        weeklyRevenueTarget: data.weeklyRevenueTarget,
        targetDeals: data.targetDeals,
        pipelineCoverage: data.pipelineCoverage,
      };
      const updated = await updateSalesPlanning(payload);
      setPlan(updated);
      toast({
        title: "Success",
        description: "Sales plan updated successfully",
      });
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast({
        title: "Error",
        description: "Failed to save sales plan",
        variant: "destructive",
      });
    }
  }

  async function onCreateDeal(data: DealFormData) {
    try {
      const payload = {
        name: data.name,
        stage: data.stage,
        value: data.value,
        expectedCloseDate: data.expectedCloseDate,
      };
      await createSalesEntry(payload);
      dealForm.reset();

      // Refresh deals
      const tracker = await getSalesTracker();
      setDeals(Array.isArray(tracker) ? tracker : []);

      toast({
        title: "Success",
        description: "Deal created successfully",
      });
    } catch (error) {
      console.error("Failed to create deal:", error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <CardSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <TableSkeleton columns={4} rows={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales CRM & Revenue Operations"
        description="Operate the monthly pipeline, follow-ups, sales targets, and weekly revenue rhythm from one place."
      />

      <Tabs defaultValue="prospects" className="flex flex-col gap-6">
        <TabsList className="w-full justify-start sm:w-fit">
          <TabsTrigger value="prospects">CRM Pipeline</TabsTrigger>
          <TabsTrigger value="overview">Planning & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">

      {/* LOG WEEKLY SALES - Primary action */}
      <LogWeeklySalesSection />

      {/* WEEKLY TARGETS KPI STRIP */}
      <WeeklyTargetsSection />

      {/* WEEKLY ACTIVITY EXECUTION (Leading Indicators) */}
      <WeeklyActivitySummary
        data={activitySummary}
        isLoading={activitySummaryLoading}
        isError={activitySummaryError}
        onRetry={() => refetchActivitySummary()}
      />

      {/* WEEKLY OUTCOMES COMMITMENTS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Outcome Commitments
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What you committed to complete this week
          </p>
        </CardHeader>
        <CardContent>
          <WeeklyOutcomesSummary
            data={outcomesSummary}
            isLoading={outcomesSummaryLoading}
            isError={outcomesSummaryError}
            onRetry={() => refetchOutcomesSummary()}
          />
        </CardContent>
      </Card>

      {/* WEEKLY TREND SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Trend
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <WeekRangePicker
                rangeOption={weekRangeOption}
                onRangeOptionChange={setWeekRangeOption}
                customFromWeek={customFromWeek}
                customToWeek={customToWeek}
                onCustomFromWeekChange={setCustomFromWeek}
                onCustomToWeekChange={setCustomToWeek}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchWeeklySummary()}
                disabled={weeklySummaryLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${weeklySummaryLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (weeklySummary?.items) {
                    exportWeeklySummaryToCSV(weeklySummary.items, year);
                    toast({
                      title: "Export Complete",
                      description: "Weekly summary exported to CSV",
                    });
                  }
                }}
                disabled={!weeklySummary?.items || weeklySummary.items.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {weeklySummaryLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : !weeklySummary || !weeklySummary.items || weeklySummary.items.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Weekly Data Available</AlertTitle>
              <AlertDescription>
                {!plan || (plan.weeklyRevenueTarget ?? 0) === 0 
                  ? "Set up your sales plan through onboarding to see weekly trends."
                  : "No data found for the selected week range. Try adjusting the range."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Trend Chart */}
              <SalesTrendChart items={weeklySummary.items} />

              {/* Weekly Summary Table */}
              <WeeklySummaryTable items={weeklySummary.items} />
            </>
          )}
        </CardContent>
      </Card>

      {/* SALES PLANNING */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Sales Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...planForm}>
            <form onSubmit={planForm.handleSubmit(onSavePlan)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={planForm.control}
                  name="weeklyRevenueTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Revenue Target (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="e.g., 500000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={planForm.control}
                  name="targetDeals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Deals</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={planForm.control}
                  name="pipelineCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline Coverage (x)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" placeholder="e.g., 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={planForm.formState.isSubmitting}>
                {planForm.formState.isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Plan
              </Button>
            </form>
          </Form>

          {plan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Current Weekly Target</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(plan.weeklyRevenueTarget ?? 0)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Target Deals</p>
                <p className="text-2xl font-bold mt-1">
                  {plan.targetDeals ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Pipeline Coverage</p>
                <p className="text-2xl font-bold mt-1">
                  {plan.pipelineCoverage ?? 0}x
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SALES TRACKING */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deals & Sales Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New deal form */}
          <Form {...dealForm}>
            <form onSubmit={dealForm.handleSubmit(onCreateDeal)}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={dealForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Deal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={dealForm.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={dealForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={dealForm.control}
                  name="expectedCloseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="mt-4" disabled={dealForm.formState.isSubmitting}>
                {dealForm.formState.isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Deal
              </Button>
            </form>
          </Form>

          {/* Deals table */}
          {deals.length === 0 ? (
            <div className="py-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">Track Your Pipeline</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add deals above to monitor your sales pipeline and forecast revenue.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expected Close</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.name}</TableCell>
                    <TableCell>{deal.stage}</TableCell>
                    <TableCell>{formatCurrency(deal.value ?? 0)}</TableCell>
                    <TableCell>{formatDate(deal.expectedCloseDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="prospects" className="flex flex-col gap-4">
          <SalesProspectsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
