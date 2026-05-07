import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PartyPopper, Check, ArrowRight, Rocket } from "lucide-react";
import { useCompleteOnboarding, useOnboardingState } from "@/hooks/useOnboarding";
import { Confetti } from "@/components/ui/confetti";
import { useState } from "react";

interface Step8CompleteProps {
  onBack: () => void;
}

export function Step8Complete({ onBack }: Step8CompleteProps) {
  const navigate = useNavigate();
  const { data: progress } = useOnboardingState();
  const completeMutation = useCompleteOnboarding();
  const [showConfetti, setShowConfetti] = useState(false);

  const completedSteps = [
    { label: "Profile Setup", done: progress?.profileCompleted },
    { label: "Business Identity", done: progress?.businessIdentityCompleted },
    { label: "Sales Planning", done: progress?.salesPlanCompleted },
    { label: "Activity Configuration", done: progress?.activityConfigCompleted },
    { label: "Sales Cycle Stages", done: progress?.salesCycleCompleted },
    { label: "Achievement Stages", done: progress?.achievementStagesCompleted },
    { label: "Subscription Selection", done: progress?.subscriptionCompleted },
  ];

  const allCompleted = completedSteps.every(step => step.done);

  const handleComplete = async () => {
    await completeMutation.mutateAsync();
    setShowConfetti(true);
    // Navigate to Today page after a short delay
    setTimeout(() => {
      navigate("/today");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti />}

      {/* Success Card */}
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            {completeMutation.isSuccess ? (
              <PartyPopper className="h-10 w-10 text-green-600" />
            ) : (
              <Rocket className="h-10 w-10 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {completeMutation.isSuccess 
              ? "Welcome to BG Accountability!" 
              : "You're All Set!"
            }
          </CardTitle>
          <CardDescription className="text-base">
            {completeMutation.isSuccess
              ? "Your account is ready. Let's start tracking your business growth!"
              : "Review your setup and complete your onboarding."
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Completion Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Checklist</CardTitle>
          <CardDescription>
            All steps completed! Here's what you've configured:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {completedSteps.map((step, index) => (
              <li 
                key={index}
                className="flex items-center gap-3"
              >
                <div className={`
                  flex h-6 w-6 items-center justify-center rounded-full
                  ${step.done 
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30" 
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                  }
                `}>
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* What's Next Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>View your personalized dashboard with key metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Set up your first weekly outcomes and track progress</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Log daily activities to build momentum</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Complete daily and weekly reviews to stay on track</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!allCompleted || completeMutation.isPending || completeMutation.isSuccess}
          className="min-w-[200px]"
          size="lg"
        >
          {completeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : completeMutation.isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Redirecting...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Launch Dashboard
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
