import { useState } from "react";
import {
  LayoutTemplate,
  Copy,
  Search,
  Loader2,
  Target,
  Activity,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getTemplates, applyMetricTemplate, applyActivityTemplate, applyOutcomeTemplate } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MetricTemplate {
  id: string;
  name: string;
  unit?: string;
  frequency?: string;
  target?: number;
  description?: string;
  createdAt: string;
}

interface OutcomeTemplate {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  createdAt: string;
}

interface ActivityTemplate {
  id: string;
  name: string;
  category?: string;
  description?: string;
  weeklyTarget?: number;
  createdAt: string;
}

function MetricTemplateCard({
  template,
  onApply,
  isApplying,
}: {
  template: MetricTemplate;
  onApply: (template: MetricTemplate) => void;
  isApplying: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {template.name}
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              {template.unit && (
                <Badge variant="outline">{template.unit}</Badge>
              )}
              {template.frequency && (
                <Badge variant="secondary">{template.frequency}</Badge>
              )}
              {template.target && (
                <Badge variant="default">Suggested: {template.target}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        )}
        <div className="flex items-center justify-end">
          <Button size="sm" variant="outline" onClick={() => onApply(template)} disabled={isApplying}>
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Apply to My Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityTemplateCard({
  template,
  onApply,
  isApplying,
}: {
  template: ActivityTemplate;
  onApply: () => void;
  isApplying: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              {template.name}
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              {template.category && (
                <Badge variant="outline">{template.category}</Badge>
              )}
              {template.weeklyTarget && (
                <Badge variant="secondary">Weekly: {template.weeklyTarget}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        )}
        <div className="flex items-center justify-end">
          <Button size="sm" variant="outline" onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Apply to My Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OutcomeTemplateCard({
  template,
  onApply,
  isApplying,
}: {
  template: OutcomeTemplate;
  onApply: () => void;
  isApplying: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {template.title}
            </CardTitle>
            {template.priority && (
              <Badge variant="outline">{template.priority}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        )}
        <div className="flex items-center justify-end">
          <Button size="sm" variant="outline" onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Apply to My Outcomes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  
  // Dialog state for customizing metric target
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [selectedMetricTemplate, setSelectedMetricTemplate] = useState<MetricTemplate | null>(null);
  const [customTarget, setCustomTarget] = useState<string>("");

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const applyMetricMutation = useMutation({
    mutationFn: ({ templateId, target }: { templateId: string; target?: number }) => 
      applyMetricTemplate(templateId, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({ title: "Success", description: "Metric added to your dashboard!" });
      setTargetDialogOpen(false);
      setSelectedMetricTemplate(null);
      setCustomTarget("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to apply template", variant: "destructive" });
    },
    onSettled: () => setApplyingId(null),
  });

  const applyActivityMutation = useMutation({
    mutationFn: applyActivityTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({ title: "Success", description: "Activity template applied successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to apply template", variant: "destructive" });
    },
    onSettled: () => setApplyingId(null),
  });

  const applyOutcomeMutation = useMutation({
    mutationFn: applyOutcomeTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outcomes"] });
      toast({ title: "Success", description: "Outcome template applied successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to apply template", variant: "destructive" });
    },
    onSettled: () => setApplyingId(null),
  });

  const handleApplyMetric = (template: MetricTemplate) => {
    setSelectedMetricTemplate(template);
    setCustomTarget(template.target?.toString() || "");
    setTargetDialogOpen(true);
  };

  const handleConfirmMetricApply = () => {
    if (!selectedMetricTemplate) return;
    setApplyingId(selectedMetricTemplate.id);
    const target = customTarget ? parseFloat(customTarget) : undefined;
    applyMetricMutation.mutate({ templateId: selectedMetricTemplate.id, target });
  };

  const handleApplyActivity = (templateId: string) => {
    setApplyingId(templateId);
    applyActivityMutation.mutate(templateId);
  };

  const handleApplyOutcome = (templateId: string) => {
    setApplyingId(templateId);
    applyOutcomeMutation.mutate(templateId);
  };

  const metrics = (templates?.metrics || []) as MetricTemplate[];
  const activities = (templates?.activities || []) as ActivityTemplate[];
  const outcomes = (templates?.outcomes || []) as OutcomeTemplate[];

  const filteredMetrics = metrics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredActivities = activities.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredOutcomes = outcomes.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LayoutTemplate className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load templates</p>
      </div>
    );
  }

  const totalTemplates = metrics.length + activities.length + outcomes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Browse and apply pre-configured templates to quickly set up your tracking
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Templates are curated by your organization admin. Click "Apply" to add a template to your dashboard.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Empty State */}
      {totalTemplates === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <LayoutTemplate className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">Templates Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Templates are pre-built metrics, outcomes, and activities created by your platform administrator.
              They help you get started quickly without setting up everything from scratch.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, you can create custom metrics and outcomes directly from those pages.
            </p>
          </div>
        </div>
      )}

      {/* Tabs for different template types */}
      {totalTemplates > 0 && (
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metrics" className="gap-2">
              <Target className="h-4 w-4" />
              Metrics ({metrics.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="h-4 w-4" />
              Activities ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Outcomes ({outcomes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {filteredMetrics.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No metric templates found
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMetrics.map((template) => (
                  <MetricTemplateCard
                    key={template.id}
                    template={template}
                    onApply={handleApplyMetric}
                    isApplying={applyingId === template.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity templates found
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredActivities.map((template) => (
                  <ActivityTemplateCard
                    key={template.id}
                    template={template}
                    onApply={() => handleApplyActivity(template.id)}
                    isApplying={applyingId === template.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-4">
            {filteredOutcomes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No outcome templates found
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOutcomes.map((template) => (
                  <OutcomeTemplateCard
                    key={template.id}
                    template={template}
                    onApply={() => handleApplyOutcome(template.id)}
                    isApplying={applyingId === template.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog for customizing metric target */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Set Your Target
            </DialogTitle>
            <DialogDescription>
              Customize the target for <strong>{selectedMetricTemplate?.name}</strong> based on your goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">Daily/Weekly Target</Label>
              <Input
                id="target"
                type="number"
                placeholder="Enter your target"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                className="text-lg"
              />
              {selectedMetricTemplate?.target && (
                <p className="text-sm text-muted-foreground">
                  Suggested target: {selectedMetricTemplate.target}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTargetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmMetricApply}
              disabled={applyMetricMutation.isPending}
            >
              {applyMetricMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Add Metric
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
