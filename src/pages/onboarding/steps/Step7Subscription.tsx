import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, CreditCard, Check, Star, Zap, Crown } from "lucide-react";
import { useSubscriptionSelectionQuery, useSelectSubscription } from "@/hooks/useOnboarding";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with basic features",
    icon: Zap,
    features: [
      "Basic dashboard",
      "Up to 5 metrics",
      "Weekly outcomes tracking",
      "Basic insights",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 499,
    period: "month",
    description: "For small teams getting started",
    icon: Zap,
    features: [
      "Everything in Free",
      "Team collaboration (up to 3)",
      "Advanced metrics",
      "Sales tracking",
      "Email reminders",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: 999,
    period: "month",
    description: "For growing businesses",
    icon: Star,
    popular: true,
    features: [
      "Everything in Starter",
      "Team collaboration (up to 10)",
      "Custom sales pipeline",
      "Achievement milestones",
      "Priority support",
      "API access",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 0,
    period: "custom",
    description: "For large teams and organizations",
    icon: Crown,
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom reporting",
      "White-label options",
    ],
  },
];

interface Step7SubscriptionProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step7Subscription({ onNext, onBack }: Step7SubscriptionProps) {
  const { data: existingData, isLoading } = useSubscriptionSelectionQuery();
  const selectMutation = useSelectSubscription();

  const selectedPlan = existingData?.selectedPlan || null;

  const handleSelectPlan = async (planId: string) => {
    const planData = PLANS.find(p => p.id === planId);
    if (!planData) return;

    await selectMutation.mutateAsync({
      plan: planId as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
    });
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onNext();
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
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6" />
            Choose Your Plan
          </CardTitle>
          <CardDescription className="text-base">
            Select the plan that best fits your business needs. You can upgrade or downgrade anytime.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const isSelecting = selectMutation.isPending && selectMutation.variables?.plan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                isSelected && "border-primary ring-2 ring-primary",
                plan.popular && "border-primary/50"
              )}
              onClick={() => !selectMutation.isPending && handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2 text-sm text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  disabled={selectMutation.isPending}
                >
                  {isSelecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSelected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Info Note */}
      <Card className="bg-muted/50">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          <p>
            All plans include a 14-day free trial of Pro features. No credit card required to start.
          </p>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan || selectMutation.isPending}
          className="min-w-[150px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
