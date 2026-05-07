import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  } | "up" | "down" | "neutral";
  className?: string;
  variant?: "default" | "primary" | "gradient";
}

export function KpiCard({ 
  title, 
  value, 
  description, 
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = "default"
}: KpiCardProps) {
  const isGradient = variant === "gradient";
  const isPrimary = variant === "primary";

  // Handle both object and string trend formats
  const trendDirection = typeof trend === "string" 
    ? trend 
    : trend 
      ? (trend.isPositive ? "up" : "down") 
      : undefined;
  
  const trendValue = typeof trend === "object" && trend ? trend.value : undefined;

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      isGradient && "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0",
      isPrimary && "bg-primary text-primary-foreground border-0",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              (isGradient || isPrimary) ? "opacity-90" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className={cn(
                "text-sm",
                (isGradient || isPrimary) ? "opacity-80" : "text-muted-foreground"
              )}>
                {description}
              </p>
            )}
            {subtitle && (
              <p className={cn(
                "text-sm",
                (isGradient || isPrimary) ? "opacity-80" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
            {trendDirection && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trendDirection === "up" && "text-green-500",
                trendDirection === "down" && "text-red-500",
                trendDirection === "neutral" && "text-yellow-500",
                (isGradient || isPrimary) && trendDirection === "up" && "text-green-300",
                (isGradient || isPrimary) && trendDirection === "down" && "text-red-300",
                (isGradient || isPrimary) && trendDirection === "neutral" && "text-yellow-300"
              )}>
                {trendDirection === "up" && <TrendingUp className="h-4 w-4" />}
                {trendDirection === "down" && <TrendingDown className="h-4 w-4" />}
                {trendDirection === "neutral" && <Minus className="h-4 w-4" />}
                {trendValue !== undefined && <span>{Math.abs(trendValue)}%</span>}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              (isGradient || isPrimary) ? "bg-white/10" : "bg-muted"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                (isGradient || isPrimary) ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
