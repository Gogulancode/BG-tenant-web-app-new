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
import { Loader2, GitBranch, Plus, Trash2, Wand2, GripVertical } from "lucide-react";
import { useSalesCycleQuery, useUpsertSalesCycle, useApplyDefaultSalesCycle } from "@/hooks/useOnboarding";
import { Badge } from "@/components/ui/badge";

const salesCycleSchema = z.object({
  stages: z.array(z.object({
    name: z.string().min(2, "Stage name required"),
    orderIndex: z.number(),
    probability: z.coerce.number().min(0).max(100, "Must be 0-100"),
    avgDurationDays: z.coerce.number().min(1, "Must be at least 1 day"),
  })).min(2, "Add at least 2 stages"),
});

type SalesCycleFormData = z.infer<typeof salesCycleSchema>;

interface Step5SalesCycleProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step5SalesCycle({ onNext, onBack }: Step5SalesCycleProps) {
  const { data: existingData, isLoading } = useSalesCycleQuery();
  const upsertMutation = useUpsertSalesCycle();
  const applyDefaultsMutation = useApplyDefaultSalesCycle();

  const form = useForm<SalesCycleFormData>({
    resolver: zodResolver(salesCycleSchema),
    defaultValues: {
      stages: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "stages",
  });

  // Pre-fill form if data exists
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      form.reset({
        stages: existingData.map((item, idx) => ({
          name: item.name,
          orderIndex: idx,
          probability: item.probability,
          avgDurationDays: item.avgDurationDays,
        })),
      });
    }
  }, [existingData, form]);

  const onSubmit = async (data: SalesCycleFormData) => {
    // Ensure orderIndex is correct and all fields are present
    const orderedStages = data.stages.map((stage, idx) => ({
      name: stage.name,
      orderIndex: idx,
      probability: stage.probability,
      avgDurationDays: stage.avgDurationDays,
    }));
    await upsertMutation.mutateAsync({ stages: orderedStages });
    onNext();
  };

  const handleApplyDefaults = async () => {
    await applyDefaultsMutation.mutateAsync();
    // Refetch will update the form
  };

  const addNewStage = () => {
    const nextIndex = fields.length;
    append({
      name: "",
      orderIndex: nextIndex,
      probability: 50,
      avgDurationDays: 7,
    });
  };

  const moveStage = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex >= 0 && toIndex < fields.length) {
      move(fromIndex, toIndex);
    }
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
              <GitBranch className="h-5 w-5" />
              Sales Pipeline Stages
            </CardTitle>
            <CardDescription>
              Define the stages of your sales cycle. Each stage should represent a clear step in your sales process.
              Set the probability of closing and average duration for each stage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              onClick={handleApplyDefaults}
              disabled={applyDefaultsMutation.isPending}
            >
              {applyDefaultsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Apply Default Stages
            </Button>
          </CardContent>
        </Card>

        {/* Stage List */}
        <div className="space-y-3">
          {fields.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No stages defined yet. Click "Apply Default Stages" or add your own.
              </CardContent>
            </Card>
          )}

          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Order Controls */}
                  <div className="flex flex-col items-center gap-1 pt-6">
                    <Badge variant="outline" className="text-xs font-mono">
                      {index + 1}
                    </Badge>
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStage(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStage(index, "down")}
                        disabled={index === fields.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>

                  {/* Stage Fields */}
                  <div className="flex-1 grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`stages.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Qualified Lead" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stages.${index}.probability`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Win Probability (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={100} {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Likelihood of closing at this stage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stages.${index}.avgDurationDays`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avg Duration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Typical time in this stage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="pt-6">
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
          Add Stage
        </Button>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={upsertMutation.isPending || fields.length < 2}
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
