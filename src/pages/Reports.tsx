import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBusinessProfileReport, useGenerateReport } from "@/hooks/useReports";
import type { BusinessProfileReport, SalesProspectStatus } from "@/lib/api";

const prospectStatuses: SalesProspectStatus[] = [
  "COLD",
  "WARM",
  "HOT",
  "CONVERTED",
  "REJECTED",
];

const dayLabels: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const painPointLabels: Record<string, string> = {
  gettingCustomers: "Getting customers",
  pricing: "Pricing",
  negotiating: "Negotiating",
  referrals: "Referrals",
  retaining: "Retaining customers",
  executingPlans: "Executing plans",
};

function formatCurrency(value?: number | null) {
  if (!value) return "Rs. 0";
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatNumber(value?: number | null) {
  return Math.round(value || 0).toLocaleString("en-IN");
}

function formatLabel(value?: string | null) {
  if (!value) return "Not set";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toTextList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function getPainPoints(report: BusinessProfileReport) {
  return Object.entries(report.owner.painPoints || {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => painPointLabels[key] || formatLabel(key));
}

function StatBlock({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function EmptyLine({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export default function Reports() {
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const businessProfile = useBusinessProfileReport();
  const generateReport = useGenerateReport();
  const report = businessProfile.data;

  const painPoints = useMemo(
    () => (report ? getPainPoints(report) : []),
    [report],
  );
  const keywords = useMemo(
    () => toTextList(report?.businessIdentity?.keywords),
    [report?.businessIdentity?.keywords],
  );
  const offerings = useMemo(
    () => toTextList(report?.businessIdentity?.offerings),
    [report?.businessIdentity?.offerings],
  );

  const handleGenerate = () => {
    generateReport.mutate({ type: reportType, format: "pdf" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }

            #business-profile-report,
            #business-profile-report * {
              visibility: visible;
            }

            #business-profile-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: 0;
              box-shadow: none;
            }

            @page {
              size: A4;
              margin: 14mm;
            }
          }
        `}
      </style>

      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-muted-foreground">
            Review and export your business accountability profile
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => businessProfile.refetch()}
            disabled={businessProfile.isFetching}
          >
            {businessProfile.isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button onClick={handlePrint} disabled={!report}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {businessProfile.isLoading && (
        <Card>
          <CardContent className="flex items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing your business profile...
          </CardContent>
        </Card>
      )}

      {businessProfile.isError && (
        <Card>
          <CardContent className="py-8">
            <p className="font-medium text-destructive">Unable to load profile report</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(businessProfile.error as Error).message}
            </p>
          </CardContent>
        </Card>
      )}

      {report && (
        <article
          id="business-profile-report"
          className="rounded-md border bg-background shadow-sm print:rounded-none"
        >
          <header className="border-b bg-muted/30 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                  Business Accountability Profile
                </p>
                <h2 className="mt-2 text-3xl font-bold text-foreground">
                  {report.businessIdentity?.companyName || report.tenant.name}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {report.businessIdentity?.description ||
                    report.owner.businessDescription ||
                    "Business profile summary"}
                </p>
              </div>
              <div className="text-sm text-muted-foreground md:text-right">
                <p>Prepared for {report.owner.name}</p>
                <p>{report.owner.email}</p>
                <p>
                  Generated{" "}
                  {new Date(report.metadata.generatedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-8 p-6">
            <section>
              <SectionTitle icon={FileText} title="Business Identity" />
              <div className="grid gap-4 md:grid-cols-4">
                <StatBlock label="Customer Type" value={formatLabel(report.businessIdentity?.customerType)} />
                <StatBlock label="Offering" value={formatLabel(report.businessIdentity?.offeringType)} />
                <StatBlock label="Registration" value={formatLabel(report.businessIdentity?.registrationStatus)} />
                <StatBlock label="Business Type" value={formatLabel(report.owner.businessType)} />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Unique Selling Proposition</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {report.businessIdentity?.usp ||
                      report.businessSetup?.uspValue ||
                      "Not captured yet"}
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Primary Customer Segment</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {report.businessSetup?.customerSegmentValue || "Not captured yet"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Offerings</p>
                  {offerings.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offerings.map((offering) => (
                        <Badge key={offering} variant="secondary">
                          {offering}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyLine>No offerings added yet</EmptyLine>
                  )}
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Keywords</p>
                  {keywords.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyLine>No keywords added yet</EmptyLine>
                  )}
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Current Challenges</p>
                  {painPoints.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {painPoints.map((point) => (
                        <Badge key={point} variant="secondary">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyLine>No pain points selected</EmptyLine>
                  )}
                </div>
              </div>
            </section>

            <section>
              <SectionTitle icon={Target} title="Sales Plan" />
              <div className="grid gap-4 md:grid-cols-4">
                <StatBlock
                  label="Annual Target"
                  value={formatCurrency(report.salesPlan?.projectedYearValue)}
                />
                <StatBlock
                  label="Avg Ticket Size"
                  value={formatCurrency(report.salesPlan?.averageTicketSize)}
                />
                <StatBlock
                  label="Expected Orders"
                  value={formatNumber(report.salesPlan?.expectedMonthlyOrders)}
                  helper="Across configured months"
                />
                <StatBlock
                  label="Expected Leads"
                  value={formatNumber(report.salesPlan?.expectedMonthlyLeads)}
                  helper={`${formatNumber(report.salesPlan?.conversionRatio)}% conversion`}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <StatBlock
                  label="Existing Customer Target"
                  value={formatCurrency(report.salesPlan?.existingCustomerTarget)}
                  helper={`${formatNumber(report.salesPlan?.existingCustomerContribution)}% contribution`}
                />
                <StatBlock
                  label="New Customer Target"
                  value={formatCurrency(report.salesPlan?.newCustomerTarget)}
                  helper={`${formatNumber(report.salesPlan?.newCustomerContribution)}% contribution`}
                />
              </div>
            </section>

            <section>
              <SectionTitle icon={Calendar} title="Activity Engine" />
              <div className="grid gap-4 md:grid-cols-3">
                <StatBlock
                  label="Weekly Activity Goal"
                  value={formatNumber(report.activities.weeklyActivityGoal)}
                />
                <StatBlock
                  label="Enabled Weekly Actions"
                  value={formatNumber(report.activities.totalEnabledWeeklyGoal)}
                />
                <StatBlock
                  label="Reminder Days"
                  value={
                    report.activities.reminderDays.length > 0
                      ? report.activities.reminderDays.map((day) => dayLabels[day] || day).join(", ")
                      : "Not set"
                  }
                />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {report.activities.enabledActivities.length > 0 ? (
                  report.activities.enabledActivities.map((activity) => (
                    <div key={activity.category} className="rounded-md border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{activity.category}</p>
                        <Badge variant="outline">{formatLabel(activity.priority)}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{activity.impact}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Weekly goal: {formatNumber(activity.weeklyGoal)} | Measure:{" "}
                        {activity.measurability}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyLine>No enabled activities found</EmptyLine>
                )}
              </div>
            </section>

            <section>
              <SectionTitle icon={Users} title="CRM Pipeline" />
              <div className="grid gap-4 md:grid-cols-4">
                <StatBlock label="Prospects" value={formatNumber(report.crm.totalProspects)} />
                <StatBlock label="Pipeline Value" value={formatCurrency(report.crm.pipelineValue)} />
                <StatBlock label="Converted Value" value={formatCurrency(report.crm.convertedValue)} />
                <StatBlock label="Active Follow-ups" value={formatNumber(report.crm.activeFollowUps)} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Status Breakdown</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                    {prospectStatuses.map((status) => (
                      <div key={status} className="rounded-md bg-muted/50 p-3 text-center">
                        <p className="font-semibold text-foreground">
                          {report.crm.byStatus[status] || 0}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatLabel(status)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-semibold text-foreground">Next Follow-ups</p>
                  <div className="mt-3 space-y-2">
                    {report.crm.nextFollowUps.length > 0 ? (
                      report.crm.nextFollowUps.map((followUp) => (
                        <div
                          key={`${followUp.prospectName}-${followUp.status}`}
                          className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">{followUp.prospectName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatLabel(followUp.status)}
                            </p>
                          </div>
                          <p className="font-medium text-foreground">
                            {formatCurrency(followUp.proposalValue)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <EmptyLine>No active follow-ups</EmptyLine>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle icon={BarChart3} title="Achievement Roadmap" />
              {report.achievementStages.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {report.achievementStages.map((stage) => (
                    <div key={stage.id} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{stage.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(stage.percentOfGoal)}% of annual target
                          </p>
                        </div>
                        <Badge variant="outline">{formatCurrency(stage.targetValue)}</Badge>
                      </div>
                      {stage.reward && (
                        <p className="mt-3 text-sm text-muted-foreground">{stage.reward}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine>No achievement stages configured</EmptyLine>
              )}
            </section>
          </div>
        </article>
      )}

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Weekly / Monthly Report
          </CardTitle>
          <CardDescription>
            Generate the existing accountability report for regular reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Report Type</Label>
            <RadioGroup
              value={reportType}
              onValueChange={(value) => setReportType(value as "weekly" | "monthly")}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {(["weekly", "monthly"] as const).map((type) => (
                <div key={type}>
                  <RadioGroupItem value={type} id={type} className="peer sr-only" />
                  <Label
                    htmlFor={type}
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Calendar className="mb-3 h-6 w-6" />
                    <span className="font-semibold capitalize">{type} Report</span>
                    <span className="mt-1 text-center text-xs text-muted-foreground">
                      {type === "weekly" ? "Summary of the past 7 days" : "Summary of the past 30 days"}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateReport.isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {generateReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>

          {generateReport.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Report generated successfully
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
