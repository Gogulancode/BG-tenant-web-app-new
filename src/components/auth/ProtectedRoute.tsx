import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { getOnboardingState } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logout } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-session";

function AuthRouteStatus({
  title,
  description,
  isError,
  onRetry,
}: {
  title: string;
  description: string;
  isError?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {isError ? (
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {isError && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="ghost" onClick={() => void logout()}>
                Sign in again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requireOnboarding = true,
}: {
  children: JSX.Element;
  requireOnboarding?: boolean;
}) {
  const location = useLocation();
  const accessToken = getAccessToken();

  const {
    data: onboardingState,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["onboarding", "progress"],
    queryFn: getOnboardingState,
    staleTime: 60 * 1000,
    retry: 1,
    enabled: Boolean(accessToken),
  });

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <AuthRouteStatus
        title="Checking your setup"
        description="We are confirming your account and onboarding status."
      />
    );
  }

  if (isError) {
    return (
      <AuthRouteStatus
        title="Unable to confirm setup"
        description="We could not verify your onboarding status. Retry the check or sign in again."
        isError
        onRetry={() => void refetch()}
      />
    );
  }

  if (requireOnboarding && onboardingState && !onboardingState.isCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const accessToken = getAccessToken();
  const {
    data: onboardingState,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["onboarding", "progress"],
    queryFn: getOnboardingState,
    staleTime: 60 * 1000,
    retry: 1,
    enabled: Boolean(accessToken),
  });

  if (!accessToken) {
    return children;
  }

  if (isLoading) {
    return (
      <AuthRouteStatus
        title="Checking your setup"
        description="We are finding the right place to take you."
      />
    );
  }

  if (isError) {
    return (
      <AuthRouteStatus
        title="Unable to confirm setup"
        description="We could not verify your onboarding status. Retry the check or sign in again."
        isError
        onRetry={() => void refetch()}
      />
    );
  }

  return <Navigate to={onboardingState?.isCompleted ? "/today" : "/onboarding"} replace />;
}
