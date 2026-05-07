import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getDailyReview,
  submitDailyReview,
  getWeeklyReview,
  submitWeeklyReview,
} from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeleton } from "@/components/ui/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CalendarDays, Loader2, CheckCircle } from "lucide-react";

const dailyReviewSchema = z.object({
  whatWentWell: z.string().max(2000, "Maximum 2000 characters").default(""),
  needsImprovement: z.string().max(2000, "Maximum 2000 characters").default(""),
  priorities: z.string().max(2000, "Maximum 2000 characters").default(""),
});

const weeklyReviewSchema = z.object({
  achievements: z.string().max(2000, "Maximum 2000 characters").default(""),
  challenges: z.string().max(2000, "Maximum 2000 characters").default(""),
  plan: z.string().max(2000, "Maximum 2000 characters").default(""),
});

type DailyReviewFormData = z.infer<typeof dailyReviewSchema>;
type WeeklyReviewFormData = z.infer<typeof weeklyReviewSchema>;

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [dailySaved, setDailySaved] = useState(false);
  const [weeklySaved, setWeeklySaved] = useState(false);
  const { toast } = useToast();

  const dailyForm = useForm<DailyReviewFormData>({
    resolver: zodResolver(dailyReviewSchema),
    defaultValues: {
      whatWentWell: "",
      needsImprovement: "",
      priorities: "",
    },
  });

  const weeklyForm = useForm<WeeklyReviewFormData>({
    resolver: zodResolver(weeklyReviewSchema),
    defaultValues: {
      achievements: "",
      challenges: "",
      plan: "",
    },
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, w] = await Promise.all([
          getDailyReview(),
          getWeeklyReview(),
        ]);

        if (d) {
          dailyForm.reset({
            whatWentWell: d.whatWentWell || "",
            needsImprovement: d.needsImprovement || "",
            priorities: d.priorities || "",
          });
          if (d.whatWentWell || d.needsImprovement || d.priorities) {
            setDailySaved(true);
          }
        }

        if (w) {
          weeklyForm.reset({
            achievements: w.achievements || "",
            challenges: w.challenges || "",
            plan: w.plan || "",
          });
          if (w.achievements || w.challenges || w.plan) {
            setWeeklySaved(true);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onDailySubmit(data: DailyReviewFormData) {
    try {
      const payload = {
        whatWentWell: data.whatWentWell || "",
        needsImprovement: data.needsImprovement || "",
        priorities: data.priorities || "",
      };
      await submitDailyReview(payload);
      setDailySaved(true);
      toast({
        title: "Success",
        description: "Daily review saved successfully",
      });
    } catch (err) {
      console.error("Failed to submit daily review:", err);
      toast({
        title: "Error",
        description: "Failed to save daily review",
        variant: "destructive",
      });
    }
  }

  async function onWeeklySubmit(data: WeeklyReviewFormData) {
    try {
      const payload = {
        achievements: data.achievements || "",
        challenges: data.challenges || "",
        plan: data.plan || "",
      };
      await submitWeeklyReview(payload);
      setWeeklySaved(true);
      toast({
        title: "Success",
        description: "Weekly review saved successfully",
      });
    } catch (err) {
      console.error("Failed to submit weekly review:", err);
      toast({
        title: "Error",
        description: "Failed to save weekly review",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reviews" description="Loading..." />
        <Card>
          <CardContent className="p-6">
            <FormSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reviews"
        description="Reflect on your progress and strengthen your weekly execution."
      />

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Review
            {dailySaved && <CheckCircle className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Weekly Review
            {weeklySaved && <CheckCircle className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...dailyForm}>
                <form onSubmit={dailyForm.handleSubmit(onDailySubmit)} className="space-y-6">
                  <FormField
                    control={dailyForm.control}
                    name="whatWentWell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What went well today?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Reflect on your wins today..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Celebrate your accomplishments, no matter how small.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={dailyForm.control}
                    name="needsImprovement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What needs improvement?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What could you do better tomorrow?"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be honest about areas for growth.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={dailyForm.control}
                    name="priorities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top priorities for tomorrow</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are your top 3 priorities?"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Set yourself up for a productive tomorrow.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={dailyForm.formState.isSubmitting}>
                    {dailyForm.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Daily Review
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Weekly Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...weeklyForm}>
                <form onSubmit={weeklyForm.handleSubmit(onWeeklySubmit)} className="space-y-6">
                  <FormField
                    control={weeklyForm.control}
                    name="achievements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biggest achievements this week</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are you proud of this week?"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Recognize your wins and progress.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={weeklyForm.control}
                    name="challenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major challenges faced</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What obstacles did you encounter?"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Understanding challenges helps you overcome them.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={weeklyForm.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan for next week</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What will you focus on next week?"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Set clear intentions for the week ahead.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={weeklyForm.formState.isSubmitting}>
                    {weeklyForm.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Weekly Review
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
