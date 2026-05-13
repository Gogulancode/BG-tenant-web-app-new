import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  getOnboardingState,
  updateOnboarding,
  updateOnboardingProfile,
  getBusinessIdentity,
  upsertBusinessIdentity,
  getSalesPlan,
  upsertSalesPlan,
  getActivityConfiguration,
  upsertActivityConfiguration,
  getSalesCycle,
  upsertSalesCycle,
  applyDefaultSalesCycle,
  getAchievementStages,
  upsertAchievementStages,
  getSubscriptionSelection,
  selectSubscription,
  completeOnboarding,
  OnboardingProgress,
  UpdateOnboardingPayload,
  ProfileOnboardingPayload,
  BusinessIdentityPayload,
  SalesPlanPayload,
  ActivityConfigurationPayload,
  SalesCycleSetupPayload,
  AchievementStagesSetupPayload,
  SubscriptionSelectionPayload,
} from "@/lib/api";
import { invalidateOperatingSystem } from "@/lib/queryInvalidation";

export const ONBOARDING_STEPS = [
  {
    id: "PROFILE",
    label: "Profile",
    stepNumber: 1,
    flagName: "profileCompleted",
  },
  {
    id: "BUSINESS_IDENTITY",
    label: "Business Identity",
    stepNumber: 2,
    flagName: "businessIdentityCompleted",
  },
  {
    id: "SALES_PLAN",
    label: "Sales Planning",
    stepNumber: 3,
    flagName: "salesPlanCompleted",
  },
  {
    id: "ACTIVITY_CONFIG",
    label: "Activity Setup",
    stepNumber: 4,
    flagName: "activityConfigCompleted",
  },
  {
    id: "SALES_CYCLE",
    label: "Sales Cycle",
    stepNumber: 5,
    flagName: "salesCycleCompleted",
  },
  {
    id: "ACHIEVEMENT_STAGES",
    label: "Achievement Stages",
    stepNumber: 6,
    flagName: "achievementStagesCompleted",
  },
  {
    id: "SUBSCRIPTION",
    label: "Subscription",
    stepNumber: 7,
    flagName: "subscriptionCompleted",
  },
  {
    id: "VISUAL_SETUP",
    label: "Finish",
    stepNumber: 8,
    flagName: "visualSetupCompleted",
  },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

// Query Keys
const ONBOARDING_KEYS = {
  all: ["onboarding"] as const,
  progress: () => [...ONBOARDING_KEYS.all, "progress"] as const,
  businessIdentity: () =>
    [...ONBOARDING_KEYS.all, "business-identity"] as const,
  salesPlan: () => [...ONBOARDING_KEYS.all, "sales-plan"] as const,
  activityConfig: () => [...ONBOARDING_KEYS.all, "activity-config"] as const,
  salesCycle: () => [...ONBOARDING_KEYS.all, "sales-cycle"] as const,
  achievementStages: () =>
    [...ONBOARDING_KEYS.all, "achievement-stages"] as const,
  subscription: () => [...ONBOARDING_KEYS.all, "subscription"] as const,
};

function invalidateOnboardingOperatingData(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.progress() });
  invalidateOperatingSystem(queryClient);
}

// ============================================
// ONBOARDING PROGRESS
// ============================================

export function useOnboardingState() {
  return useQuery<OnboardingProgress, Error>({
    queryKey: ONBOARDING_KEYS.progress(),
    queryFn: getOnboardingState,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOnboardingPayload) => updateOnboarding(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEYS.progress(), data);
      invalidateOperatingSystem(queryClient);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 1: PROFILE
// ============================================

export function useUpdateProfileOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileOnboardingPayload) =>
      updateOnboardingProfile(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 2: BUSINESS IDENTITY
// ============================================

export function useBusinessIdentityQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.businessIdentity(),
    queryFn: getBusinessIdentity,
    staleTime: 60 * 1000,
  });
}

export function useUpsertBusinessIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BusinessIdentityPayload) =>
      upsertBusinessIdentity(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_KEYS.businessIdentity(),
      });
      toast({
        title: "Business identity saved!",
        description: "Your business details have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save business identity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 3: SALES PLAN
// ============================================

export function useSalesPlanQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.salesPlan(),
    queryFn: getSalesPlan,
    staleTime: 60 * 1000,
  });
}

export function useUpsertSalesPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalesPlanPayload) => upsertSalesPlan(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.salesPlan() });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Sales plan saved!",
        description: "Your sales targets have been configured.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save sales plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 4: ACTIVITY CONFIGURATION
// ============================================

export function useActivityConfigurationQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.activityConfig(),
    queryFn: getActivityConfiguration,
    staleTime: 60 * 1000,
  });
}

export function useUpsertActivityConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActivityConfigurationPayload) =>
      upsertActivityConfiguration(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_KEYS.activityConfig(),
      });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Activity settings saved!",
        description: "Your activity tracking preferences have been set.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save activity configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 5: SALES CYCLE
// ============================================

export function useSalesCycleQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.salesCycle(),
    queryFn: getSalesCycle,
    staleTime: 60 * 1000,
  });
}

export function useUpsertSalesCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalesCycleSetupPayload) => upsertSalesCycle(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.salesCycle() });
      toast({
        title: "Sales cycle saved!",
        description: "Your sales pipeline stages have been configured.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save sales cycle",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useApplyDefaultSalesCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applyDefaultSalesCycle(),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.salesCycle() });
      toast({
        title: "Default stages applied!",
        description: "Standard sales pipeline stages have been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to apply defaults",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 6: ACHIEVEMENT STAGES
// ============================================

export function useAchievementStagesQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.achievementStages(),
    queryFn: getAchievementStages,
    staleTime: 60 * 1000,
  });
}

export function useUpsertAchievementStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AchievementStagesSetupPayload) =>
      upsertAchievementStages(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_KEYS.achievementStages(),
      });
      toast({
        title: "Achievement stages saved!",
        description: "Your milestone targets have been configured.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save achievement stages",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 7: SUBSCRIPTION
// ============================================

export function useSubscriptionSelectionQuery() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.subscription(),
    queryFn: getSubscriptionSelection,
    staleTime: 60 * 1000,
  });
}

export function useSelectSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionSelectionPayload) =>
      selectSubscription(payload),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_KEYS.subscription(),
      });
      toast({
        title: "Subscription selected!",
        description: "Your plan has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to select subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// STEP 8: COMPLETE ONBOARDING
// ============================================

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: () => {
      invalidateOnboardingOperatingData(queryClient);
      toast({
        title: "Welcome to BG Accountability!",
        description: "Your setup is complete. Let's get started!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete onboarding",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isStepCompleted(
  stepsCompleted: string[],
  stepId: OnboardingStepId,
): boolean {
  return stepsCompleted.includes(stepId);
}

export function getNextIncompleteStep(
  stepsCompleted: string[],
): OnboardingStepId | null {
  for (const step of ONBOARDING_STEPS) {
    if (!stepsCompleted.includes(step.id)) {
      return step.id;
    }
  }
  return null;
}

export function getStepFromFlags(stepFlags: {
  profileCompleted: boolean;
  businessIdentityCompleted: boolean;
  salesPlanCompleted: boolean;
  activityConfigCompleted: boolean;
  salesCycleCompleted: boolean;
  achievementStagesCompleted: boolean;
  subscriptionCompleted: boolean;
  visualSetupCompleted: boolean;
}): number {
  if (!stepFlags.profileCompleted) return 1;
  if (!stepFlags.businessIdentityCompleted) return 2;
  if (!stepFlags.salesPlanCompleted) return 3;
  if (!stepFlags.activityConfigCompleted) return 4;
  if (!stepFlags.salesCycleCompleted) return 5;
  if (!stepFlags.achievementStagesCompleted) return 6;
  if (!stepFlags.subscriptionCompleted) return 7;
  return 8;
}
