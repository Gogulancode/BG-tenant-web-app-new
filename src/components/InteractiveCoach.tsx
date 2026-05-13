import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CoachStep = {
  label: string;
  helper?: string;
};

type CoachMetric = {
  label: string;
  value: string | number;
};

type CoachAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
};

export function InteractiveCoachHero({
  actionLabel,
  children,
  icon: Icon = Sparkles,
  metricLabel,
  metricValue,
  onAction,
  progress,
  steps,
  title,
  to,
}: {
  actionLabel?: string;
  children: string;
  icon?: LucideIcon;
  metricLabel?: string;
  metricValue?: string | number;
  onAction?: () => void;
  progress?: number;
  steps?: CoachStep[];
  title: string;
  to?: string;
}) {
  const action = actionLabel ? (
    to ? (
      <Link to={to}>
        <Button className="gap-2 bg-white text-primary hover:bg-white/90">
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    ) : (
      <Button
        className="gap-2 bg-white text-primary hover:bg-white/90"
        onClick={onAction}
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    )
  ) : null;

  return (
    <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-emerald-950 via-primary to-emerald-400 text-primary-foreground shadow-card">
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_220px] md:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-white/15">
              <Icon className="h-5 w-5" />
            </span>
            <Badge className="bg-white/15 text-white hover:bg-white/15">
              Business coach
            </Badge>
          </div>
          <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-normal md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 md:text-base">
            {children}
          </p>
          {steps?.length ? (
            <div className="mt-5 grid gap-2 rounded-lg border border-white/15 bg-white/10 p-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{step.label}</p>
                    {step.helper ? (
                      <p className="mt-1 text-xs leading-5 text-white/70">
                        {step.helper}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {action ? <div className="mt-5">{action}</div> : null}
        </div>

        <div className="rounded-lg border border-white/15 bg-white/10 p-4">
          <p className="text-sm font-medium text-white/70">
            {metricLabel ?? "Momentum"}
          </p>
          <p className="mt-2 text-4xl font-semibold">{metricValue ?? "Live"}</p>
          {typeof progress === "number" ? (
            <>
              <Progress
                value={Math.max(0, Math.min(100, progress))}
                className="mt-4 h-2 bg-white/20"
              />
              <p className="mt-3 text-xs leading-5 text-white/70">
                Updated from the same tenant API used by web and mobile.
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs leading-5 text-white/70">
              Guidance changes as setup, activities, CRM, and sales move.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function CoachActionLane({
  items,
  title = "Action lane",
}: {
  items: Array<
    CoachMetric & { helper?: string; icon?: LucideIcon; to?: string }
  >;
  title?: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold tracking-normal">{title}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon ?? CheckCircle2;
          const content = (
            <div className="h-full rounded-lg border bg-card p-4 shadow-soft transition hover:border-primary/30 hover:bg-primary/5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <Badge variant="outline">{item.value}</Badge>
              </div>
              <p className="mt-4 font-semibold text-foreground">{item.label}</p>
              {item.helper ? (
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {item.helper}
                </p>
              ) : null}
            </div>
          );

          return item.to ? (
            <Link key={item.label} to={item.to} className="block">
              {content}
            </Link>
          ) : (
            <div key={item.label}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

export function CoachResultCard({
  actions,
  children,
  metrics,
  title,
}: {
  actions?: CoachAction[];
  children: string;
  metrics?: CoachMetric[];
  title: string;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {children}
          </p>
          {metrics?.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border bg-background p-3"
                >
                  <p className="text-lg font-semibold text-primary">
                    {metric.value}
                  </p>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {actions?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action) =>
                action.to ? (
                  <Link key={action.label} to={action.to}>
                    <Button size="sm" variant={action.variant ?? "outline"}>
                      {action.label}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={action.label}
                    size="sm"
                    variant={action.variant ?? "outline"}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
