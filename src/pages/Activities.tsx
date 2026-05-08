import { useEffect, useState } from "react";
import { getActivities } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Filter, X, Activity, Calendar } from "lucide-react";

const activityTypes = [
  { value: "metric", label: "Metric" },
  { value: "outcome", label: "Outcome" },
  { value: "review", label: "Review" },
  { value: "sale", label: "Sale" },
  { value: "insight", label: "Insight" },
  { value: "system", label: "System" },
];

const typeColors: Record<string, string> = {
  metric: "bg-blue-100 text-blue-800",
  outcome: "bg-green-100 text-green-800",
  review: "bg-purple-100 text-purple-800",
  sale: "bg-yellow-100 text-yellow-800",
  insight: "bg-cyan-100 text-cyan-800",
  system: "bg-gray-100 text-gray-800",
};

type ActivityLogItem = {
  id: string;
  type: string;
  action: string;
  details?: string | null;
  createdAt: string;
};

export default function Activities() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasFilters = selectedType || fromDate || toDate;

  async function loadActivities() {
    setLoading(true);
    try {
      const data = await getActivities({
        type: selectedType || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  async function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    await loadActivities();
  }

  function resetFilters() {
    setSelectedType("");
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Log"
        description="A complete history of your actions across the platform. Use filters to find specific events."
      />

      {/* FILTERS */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={applyFilters}
            className="flex flex-wrap items-end gap-4"
          >
            {/* Type Filter */}
            <div className="space-y-2 min-w-[160px]">
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-2 min-w-[160px]">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                From
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="space-y-2 min-w-[160px]">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                To
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Apply
              </Button>
              {hasFilters && (
                <Button type="button" variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ACTIVITY LIST */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton columns={4} rows={8} />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Activity}
                title="No activities found"
                description={hasFilters 
                  ? "Try adjusting your filters to find activities."
                  : "Activities will appear here as you use the app."
                }
                action={hasFilters ? resetFilters : undefined}
                actionLabel={hasFilters ? "Reset Filters" : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={typeColors[a.type] || ""}
                      >
                        {a.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{a.action}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {a.details ?? "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
