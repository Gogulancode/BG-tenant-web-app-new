import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { CoachAction } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeTenantRoute } from "@/lib/routes";

export function CoachDailyPlan({ actions }: { actions: CoachAction[] }) {
  if (actions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-normal">
          Today's coach plan
        </h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Card
            key={`${action.type}-${index}`}
            className="border-primary/15 bg-card shadow-soft transition hover:border-primary/30 hover:bg-primary/5"
          >
            <CardContent className="flex h-full flex-col gap-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <Badge
                  variant={
                    action.priority === "required" ? "default" : "outline"
                  }
                >
                  {action.priority === "required" ? "Do today" : "Stretch"}
                </Badge>
              </div>

              <div className="min-h-0 flex-1">
                <p className="font-semibold text-foreground">{action.title}</p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {action.reason}
                </p>
              </div>

              {action.route ? (
                <Link to={normalizeTenantRoute(action.route)}>
                  <Button className="w-full gap-2">
                    {action.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button className="w-full gap-2" disabled>
                  {action.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
