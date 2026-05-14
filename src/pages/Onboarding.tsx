import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  User,
  Building2,
  TrendingUp,
  ListTodo,
  GitBranch,
  Trophy,
  CreditCard,
  Rocket,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useOnboardingState,
  useUpdateOnboarding,
  ONBOARDING_STEPS,
  getStepFromFlags,
} from "@/hooks/useOnboarding";
import {
  Step1Profile,
  Step2BusinessIdentity,
  Step3SalesPlan,
  Step4ActivitySetup,
  Step5SalesCycle,
  Step6AchievementStages,
  Step7Subscription,
  Step8Complete,
} from "@/pages/onboarding/steps";

const STEP_ICONS = [
  User,
  Building2,
  TrendingUp,
  ListTodo,
  GitBranch,
  Trophy,
  CreditCard,
  Rocket,
];

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    data: onboardingState,
    isLoading: stateLoading,
    isError: stateError,
    error: onboardingError,
    refetch,
  } = useOnboardingState();
  const updateOnboarding = useUpdateOnboarding();

  // Prevent redirect loops
  const hasNavigated = useRef(false);

  // Current active step (1-based)
  const [activeStep, setActiveStep] = useState(1);

  // Determine current step from backend state
  useEffect(() => {
    if (onboardingState && !hasNavigated.current) {
      // Calculate step from flags
      const step = getStepFromFlags({
        profileCompleted: onboardingState.profileCompleted ?? false,
        businessIdentityCompleted:
          onboardingState.businessIdentityCompleted ?? false,
        salesPlanCompleted: onboardingState.salesPlanCompleted ?? false,
        activityConfigCompleted:
          onboardingState.activityConfigCompleted ?? false,
        salesCycleCompleted: onboardingState.salesCycleCompleted ?? false,
        achievementStagesCompleted:
          onboardingState.achievementStagesCompleted ?? false,
        subscriptionCompleted: onboardingState.subscriptionCompleted ?? false,
        visualSetupCompleted: onboardingState.visualSetupCompleted ?? false,
      });
      setActiveStep(onboardingState.isCompleted ? 8 : step);
    }
  }, [onboardingState, navigate]);

  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = ((activeStep - 1) / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      updateOnboarding.mutate({ currentStep: activeStep + 1 });
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      updateOnboarding.mutate({ currentStep: activeStep - 1 });
    }
  };

  const isStepCompleted = (stepNumber: number): boolean => {
    if (!onboardingState) return false;
    const stepInfo = ONBOARDING_STEPS[stepNumber - 1];
    if (!stepInfo) return false;
    const flagName = stepInfo.flagName as keyof typeof onboardingState;
    return Boolean(onboardingState[flagName]);
  };

  if (stateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    );
  }

  if (stateError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Unable to load setup
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {onboardingError?.message ||
                  "We could not load your onboarding progress. Retry before continuing."}
              </p>
            </div>
            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry setup check
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                BG Accountability
              </h1>
              <p className="text-sm text-muted-foreground">
                Let's get you set up
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Step {activeStep} of {totalSteps}
              </p>
              <p className="text-xs text-muted-foreground">
                {ONBOARDING_STEPS[activeStep - 1]?.label}
              </p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4 h-2" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Step Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-28 space-y-1">
              {ONBOARDING_STEPS.map((step, index) => {
                const Icon = STEP_ICONS[index];
                const stepNum = index + 1;
                const isCompleted = isStepCompleted(stepNum);
                const isActive = stepNum === activeStep;
                const isAccessible = stepNum <= activeStep || isCompleted;

                return (
                  <button
                    key={step.id}
                    onClick={() => isAccessible && setActiveStep(stepNum)}
                    disabled={!isAccessible}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive && isCompleted && "bg-muted hover:bg-muted/80",
                      !isActive &&
                        !isCompleted &&
                        isAccessible &&
                        "hover:bg-muted/50",
                      !isAccessible && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        isActive && "bg-primary-foreground/20",
                        isCompleted &&
                          !isActive &&
                          "bg-green-100 dark:bg-green-900/30",
                        !isActive && !isCompleted && "bg-muted",
                      )}
                    >
                      {isCompleted ? (
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-primary-foreground"
                              : "text-green-600",
                          )}
                        />
                      ) : (
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground",
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          !isActive && !isCompleted && "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isActive
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        Step {stepNum}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Step Indicators */}
            <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-2">
              {ONBOARDING_STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = isStepCompleted(stepNum);
                const isActive = stepNum === activeStep;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted &&
                        !isActive &&
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="bg-background rounded-xl border shadow-sm p-6 md:p-8">
              {activeStep === 1 && <Step1Profile onNext={handleNext} />}
              {activeStep === 2 && (
                <Step2BusinessIdentity
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {activeStep === 3 && (
                <Step3SalesPlan onNext={handleNext} onBack={handleBack} />
              )}
              {activeStep === 4 && (
                <Step4ActivitySetup onNext={handleNext} onBack={handleBack} />
              )}
              {activeStep === 5 && (
                <Step5SalesCycle onNext={handleNext} onBack={handleBack} />
              )}
              {activeStep === 6 && (
                <Step6AchievementStages
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {activeStep === 7 && (
                <Step7Subscription onNext={handleNext} onBack={handleBack} />
              )}
              {activeStep === 8 && <Step8Complete onBack={handleBack} />}
            </div>

            {/* Helper Text */}
            <p className="text-center mt-4 text-sm text-muted-foreground">
              You can always update these settings later from the Settings page.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
