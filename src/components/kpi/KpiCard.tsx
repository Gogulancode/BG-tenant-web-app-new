import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: boolean;
  trend?: "up" | "down";
  trendValue?: string;
}

const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient = false,
  trend,
  trendValue 
}: KpiCardProps) => {
  return (
    <Card className={cn(
      "shadow-card transition-all hover:shadow-lg",
      gradient && "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              gradient ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn(
                "text-sm",
                gradient ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              gradient ? "bg-white/20" : "bg-muted"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {trend && trendValue && (
          <div className="mt-4 flex items-center gap-1">
            <span className={cn(
              "text-sm font-medium",
              trend === "up" && !gradient && "text-green-600",
              trend === "down" && !gradient && "text-red-600",
              gradient && "text-primary-foreground/90"
            )}>
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </span>
            <span className={cn(
              "text-sm",
              gradient ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              vs last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
