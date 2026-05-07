import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Plus, Trash2 } from "lucide-react";
import { useAchievementStagesQuery, useUpsertAchievementStages, useSalesPlanQuery } from "@/hooks/useOnboarding";

const COLOR_OPTIONS = [
  { value: "#CD7F32", label: "Bronze" },
  { value: "#C0C0C0", label: "Silver" },
  { value: "#FFD700", label: "Gold" },
  { value: "#E5E4E2", label: "Platinum" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#22C55E", label: "Green" },
];

const achievementStagesSchema = z.object({
  stages: z.array(z.object({
    name: z.string().min(2, "Stage name required"),
    order: z.coerce.number().min(1, "Order must be at least 1"),
    targetValue: z.coerce.number().min(0, "Target must be 0 or more"),
    percentOfGoal: z.coerce.number().min(0).max(200).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color").optional(),
    icon: z.string().optional(),
    reward: z.string().optional(),
  })).min(2, "Add at least 2 achievement stages"),
});

type AchievementStagesFormData = z.infer<typeof achievementStagesSchema>;

const getDefaultStages = (annualGoal: number) => [
  { name: "Foundation", order: 1, targetValue: Math.round(annualGoal * 0.1), percentOfGoal: 10, color: "#3B82F6", icon: "target", reward: "Define USP, menu card, packages, and customer segment." },
  { name: "Reconnect", order: 2, targetValue: Math.round(annualGoal * 0.25), percentOfGoal: 25, color: "#22C55E", icon: "users", reward: "Reconnect with existing customers and activate referrals." },
  { name: "Monthly Offers", order: 3, targetValue: Math.round(annualGoal * 0.5), percentOfGoal: 50, color: "#FFD700", icon: "sparkles", reward: "Create and test monthly offers that can generate demand." },
  { name: "Paid Growth", order: 4, targetValue: Math.round(annualGoal * 0.75), percentOfGoal: 75, color: "#8B5CF6", icon: "megaphone", reward: "Run Google, Facebook, or Instagram ad experiments with clear lead tracking." },
  { name: "Retention Community", order: 5, targetValue: annualGoal, percentOfGoal: 100, color: "#E5E4E2", icon: "crown", reward: "Create customer delight and community actions for repeat business." },
];

interface Step6AchievementStagesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step6AchievementStages({ onNext, onBack }: Step6AchievementStagesProps) {
  const { data: existingData, isLoading } = useAchievementStagesQuery();
  const { data: salesPlanData } = useSalesPlanQuery();
  const upsertMutation = useUpsertAchievementStages();

  // Get annual goal from sales plan
  const annualGoal = salesPlanData?.projectedYearValue || 0;

  const form = useForm<AchievementStagesFormData>({
    resolver: zodResolver(achievementStagesSchema),
    defaultValues: {
      stages: getDefaultStages(annualGoal),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stages",
  });

  // Pre-fill form if data exists, otherwise use defaults with sales plan
  useEffect(() => {
    if (existingData?.stages?.length) {
      form.reset({
        stages: existingData.stages.map((item) => ({
          name: item.name,
          order: item.order,
          targetValue: item.targetValue,
          percentOfGoal: item.percentOfGoal,
          color: item.color,
          icon: item.icon,
          reward: item.reward,
        })),
      });
    } else if (annualGoal > 0) {
      form.reset({
        stages: getDefaultStages(annualGoal),
      });
    }
  }, [existingData, annualGoal, form]);

  const onSubmit = async (data: AchievementStagesFormData) => {
    const stages = data.stages.map((s, index) => ({
      name: s.name,
      order: index + 1, // Ensure order is sequential
      targetValue: s.targetValue,
      percentOfGoal: s.percentOfGoal,
      color: s.color,
      icon: s.icon,
      reward: s.reward,
    }));
    await upsertMutation.mutateAsync({ stages });
    onNext();
  };

  const addNewStage = () => {
    const lastStage = fields[fields.length - 1];
    const lastTargetValue = form.watch(`stages.${fields.length - 1}.targetValue`) || 0;
    append({
      name: "",
      order: fields.length + 1,
      targetValue: Math.round(lastTargetValue * 1.25),
      percentOfGoal: 0,
      color: COLOR_OPTIONS[fields.length % COLOR_OPTIONS.length].value,
      icon: "star",
      reward: "",
    });
  };

  const applyDefaults = () => {
    form.reset({ stages: getDefaultStages(annualGoal) });
  };

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) {
      return `Rs. ${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `Rs. ${(value / 100000).toFixed(2)} L`;
    }
    return `Rs. ${value.toLocaleString("en-IN")}`;
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
        {/* Intro Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievement Stages
            </CardTitle>
            <CardDescription>
              Define practical target-achievement stages based on your annual revenue target{annualGoal > 0 ? ` of ${formatCurrency(annualGoal)}` : ""}.
              These combine revenue progress with the owner actions from the BG wireframe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              onClick={applyDefaults}
              disabled={annualGoal === 0}
            >
              Reset to Defaults
            </Button>
            {annualGoal === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Complete the Sales Plan step first to auto-generate default stages.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fields.map((field, index) => {
                const color = form.watch(`stages.${index}.color`) || "#3B82F6";
                const name = form.watch(`stages.${index}.name`);
                const targetValue = form.watch(`stages.${index}.targetValue`);
                const percentOfGoal = form.watch(`stages.${index}.percentOfGoal`);
                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white"
                    style={{ backgroundColor: color }}
                  >
                    <span className="font-medium">{name || "Untitled"}</span>
                    <span className="opacity-75">
                      ({formatCurrency(targetValue || 0)}{percentOfGoal ? ` - ${percentOfGoal}%` : ""})
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stage List */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-12">
                  {/* Stage Name */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`stages.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Gold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Target Value */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`stages.${index}.targetValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Value (Rs.)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="100000" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {field.value > 0 && formatCurrency(field.value)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Percent of Goal */}
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`stages.${index}.percentOfGoal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>% of Goal</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={200} placeholder="25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Color */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`stages.${index}.color`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-full border"
                              style={{ backgroundColor: field.value || "#3B82F6" }}
                            />
                            <div className="flex flex-wrap gap-1">
                              {COLOR_OPTIONS.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  className={`h-6 w-6 rounded-full border-2 ${
                                    field.value === color.value
                                      ? "border-gray-900 dark:border-white"
                                      : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  onClick={() => field.onChange(color.value)}
                                  title={color.label}
                                />
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 flex items-end justify-end">
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Stage Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addNewStage}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Achievement Stage
        </Button>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={upsertMutation.isPending}
            className="min-w-[150px]"
          >
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
