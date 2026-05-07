import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";
import { Clock, Crown, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const subscription = settings?.subscription;
  
  // Only show for TRIAL status with trialEndsAt date
  if (!subscription || subscription.status !== "TRIAL" || !subscription.trialEndsAt) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const trialEndDate = new Date(subscription.trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Don't show if trial is already expired
  if (daysRemaining <= 0) {
    return null;
  }

  const isUrgent = daysRemaining <= 7;

  return (
    <div className={`relative px-4 py-3 flex items-center justify-center gap-3 text-sm ${
      isUrgent 
        ? "bg-amber-50 border-b border-amber-200 text-amber-800" 
        : "bg-blue-50 border-b border-blue-200 text-blue-800"
    }`}>
      <Clock className="h-4 w-4 flex-shrink-0" />
      <span>
        <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong> left in your free trial
        {isUrgent && " — upgrade now to keep your data!"}
      </span>
      <Link 
        to="/settings" 
        className={`font-medium underline underline-offset-2 hover:no-underline ${
          isUrgent ? "text-amber-900" : "text-blue-900"
        }`}
      >
        <Crown className="h-4 w-4 inline mr-1" />
        View Plans
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className={`absolute right-4 p-1 rounded hover:bg-black/5 ${
          isUrgent ? "text-amber-600" : "text-blue-600"
        }`}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
