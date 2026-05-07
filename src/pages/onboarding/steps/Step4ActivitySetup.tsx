import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Loader2, ListTodo, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useActivityConfigurationQuery, useUpsertActivityConfiguration } from "@/hooks/useOnboarding";

const WEEKDAYS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

const PRIORITY_LABELS = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;

const RELEVANCE_LABELS = {
  PRODUCT: "Product",
  SERVICE: "Service",
  BOTH: "Product & Service",
} as const;

const DEFAULT_ACTIVITIES = [
  {
    category: "Creating weekly social media content",
    priority: "HIGH" as const,
    weeklyGoal: 3,
    reminderDays: [1, 3, 5],
    measurability: "Increase or decrease in followers, views, likes, comments, and shares",
    impact: "Generating Leads",
    relevance: "BOTH" as const,
    enabled: true,
  },
  {
    category: "Creating a monthly ad campaign on social media",
    priority: "HIGH" as const,
    weeklyGoal: 1,
    reminderDays: [2],
    measurability: "Leads generated vs leads converted",
    impact: "Sales",
    relevance: "BOTH" as const,
    enabled: true,
  },
  {
    category: "Creating a delight for existing or past clients",
    priority: "MEDIUM" as const,
    weeklyGoal: 2,
    reminderDays: [4],
    measurability: "Referrals or repeat business received",
    impact: "Generating Leads",
    relevance: "SERVICE" as const,
    enabled: true,
  },
  {
    category: "Participating in exhibitions",
    priority: "MEDIUM" as const,
    weeklyGoal: 1,
    reminderDays: [1],
    measurability: "Target vs achievement on sales generated or pre-bookings",
    impact: "Sales",
    relevance: "PRODUCT" as const,
    enabled: false,
  },
  {
    category: "Sales follow-ups with warm prospects",
    priority: "HIGH" as const,
    weeklyGoal: 10,
    reminderDays: [1, 3, 5],
    measurability: "Follow-ups completed and prospects moved forward",
    impact: "Closure",
    relevance: "BOTH" as const,
    enabled: true,
  },
  {
    category: "Creating monthly offers",
    priority: "MEDIUM" as const,
    weeklyGoal: 1,
    reminderDays: [2],
    measurability: "Offer responses, inquiries, and sales conversions",
    impact: "Sales",
    relevance: "BOTH" as const,
    enabled: true,
  },
  {
    category: "Retention and customer community actions",
    priority: "MEDIUM" as const,
    weeklyGoal: 2,
    reminderDays: [5],
    measurability: "Repeat business, engagement, referrals, and testimonials",
    impact: "Retention",
    relevance: "BOTH" as const,
    enabled: true,
  },
];

const activityConfigSchema = z.object({
  activities: z
    .array(
      z.object({
        category: z.string().min(2, "Activity name required"),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
        weeklyGoal: z.coerce.number().min(1, "Must be at least 1").max(50, "Keep the weekly goal realistic"),
        reminderDays: z.array(z.number().min(0).max(6)),
        measurability: z.string().min(5, "Add how this will be measured"),
        impact: z.string().min(2, "Impact required"),
        relevance: z.enum(["PRODUCT", "SERVICE", "BOTH"]),
        enabled: z.boolean().optional(),
      }),
    )
    .min(1, "Keep at least one activity"),
});

type ActivityConfigFormData = z.infer<typeof activityConfigSchema>;

interface Step4ActivitySetupProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step4ActivitySetup({ onNext, onBack }: Step4ActivitySetupProps) {
  const { data: existingData, isLoading } = useActivityConfigurationQuery();
  const upsertMutation = useUpsertActivityConfiguration();

  const form = useForm<ActivityConfigFormData>({
    resolver: zodResolver(activityConfigSchema),
    defaultValues: {
      activities: DEFAULT_ACTIVITIES,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const activities = form.watch("activities");
  const selectedCount = activities.filter((activity) => activity.enabled !== false).length;
  const weeklyGoalTotal = activities
    .filter((activity) => activity.enabled !== false)
    .reduce((sum, activity) => sum + (Number(activity.weeklyGoal) || 0), 0);

  useEffect(() => {
    if (existingData?.activities?.length) {
      form.reset({ activities: existingData.activities });
    }
  }, [existingData, form]);

  const onSubmit = async (data: ActivityConfigFormData) => {
    const selectedActivities = data.activities.filter((activity) => activity.enabled !== false);
    await upsertMutation.mutateAsync({
      salesEnabled: selectedActivities.some((activity) =>
        ["Sales", "Closure", "Generating Leads"].includes(activity.impact),
      ),
      marketingEnabled: selectedActivities.some((activity) =>
        activity.category.toLowerCase().includes("social") || activity.category.toLowerCase().includes("ad"),
      ),
      networkingEnabled: selectedActivities.some((activity) =>
        activity.category.toLowerCase().includes("exhibition") || activity.category.toLowerCase().includes("community"),
      ),
      productDevEnabled: selectedActivities.some((activity) => activity.relevance !== "SERVICE"),
      operationsEnabled: true,
      weeklyActivityGoal: weeklyGoalTotal,
      enableReminders: true,
      reminderDays: Array.from(new Set(selectedActivities.flatMap((activity) => activity.reminderDays))).sort(),
      activities: data.activities,
    });
    onNext();
  };

  const addCustomActivity = () => {
    append({
      category: "",
      priority: "MEDIUM",
      weeklyGoal: 1,
      reminderDays: [1],
      measurability: "",
      impact: "",
      relevance: "BOTH",
      enabled: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Weekly Activity Engine
            </CardTitle>
            <CardDescription>
              Choose the actions that create leads, conversions, referrals, retention, and sales momentum.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <SummaryTile label="Selected activities" value={selectedCount} />
            <SummaryTile label="Weekly action target" value={weeklyGoalTotal} />
            <SummaryTile label="Templates available" value={fields.length} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4 lg:grid-cols-[24px_minmax(220px,1fr)_180px_120px]">
                  <FormField
                    control={form.control}
                    name={`activities.${index}.enabled`}
                    render={({ field }) => (
                      <FormItem className="pt-8">
                        <FormControl>
                          <Checkbox checked={field.value !== false} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`activities.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity</FormLabel>
                          <FormControl>
                            <Input placeholder="Activity name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`activities.${index}.measurability`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurability</FormLabel>
                            <FormControl>
                              <Textarea rows={2} placeholder="How will you measure this?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activities.${index}.impact`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impact</FormLabel>
                            <FormControl>
                              <Input placeholder="Generating Leads, Sales, Closure" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <FormField
                      control={form.control}
                      name={`activities.${index}.priority`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`activities.${index}.relevance`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Best for</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(RELEVANCE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`activities.${index}.weeklyGoal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly goal</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={50} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`activities.${index}.reminderDays`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder days</FormLabel>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {WEEKDAYS.map((day) => (
                              <label
                                key={day.id}
                                className={`flex h-8 w-10 cursor-pointer items-center justify-center rounded-md border text-xs ${
                                  field.value.includes(day.id)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background hover:bg-accent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={field.value.includes(day.id)}
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      field.onChange([...field.value, day.id].sort());
                                    } else {
                                      field.onChange(field.value.filter((value) => value !== day.id));
                                    }
                                  }}
                                />
                                {day.label}
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addCustomActivity} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add custom activity
        </Button>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={upsertMutation.isPending || selectedCount === 0} className="min-w-[150px]">
            {upsertMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <Badge variant="outline">{value}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
