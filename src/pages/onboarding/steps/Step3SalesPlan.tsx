import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Calculator, Loader2, PieChart, Target, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSalesPlanQuery, useUpsertSalesPlan } from "@/hooks/useOnboarding";

const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const defaultContribution = [8, 8, 8, 8, 9, 9, 9, 8, 8, 8, 8, 9];

const salesPlanSchema = z
  .object({
    yearMinus3Value: z.coerce.number().min(0, "Must be 0 or more").optional(),
    yearMinus2Value: z.coerce.number().min(0, "Must be 0 or more").optional(),
    yearMinus1Value: z.coerce.number().min(0, "Must be 0 or more").optional(),
    projectedYearValue: z.coerce.number().min(1, "Target must be greater than 0"),
    monthlyContribution: z.array(z.coerce.number().min(0).max(100)).length(12),
    averageTicketSize: z.coerce.number().min(1, "Average ticket size must be greater than 0"),
    conversionRatio: z.coerce
      .number()
      .min(0.01, "Conversion ratio must be greater than 0")
      .max(100, "Conversion ratio cannot exceed 100"),
    existingCustomerContribution: z.coerce.number().min(0).max(100),
    newCustomerContribution: z.coerce.number().min(0).max(100),
  })
  .refine(
    (data) => {
      const sum = data.monthlyContribution.reduce((a, b) => a + b, 0);
      return Math.abs(sum - 100) < 0.01;
    },
    {
      message: "Monthly contributions must sum to 100%",
      path: ["monthlyContribution"],
    },
  )
  .refine(
    (data) => Math.abs(data.existingCustomerContribution + data.newCustomerContribution - 100) < 0.01,
    {
      message: "Existing and new customer contribution must total 100%",
      path: ["newCustomerContribution"],
    },
  );

type SalesPlanFormData = z.infer<typeof salesPlanSchema>;

interface Step3SalesPlanProps {
  onNext: () => void;
  onBack: () => void;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "Rs. 0";
  if (value >= 10000000) {
    return `Rs. ${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `Rs. ${(value / 100000).toFixed(2)} L`;
  }
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function calculateMonthlyRevenue(target: number, contributions: number[]) {
  return contributions.map((pct) => Math.round((target * (Number(pct) || 0)) / 100));
}

export function Step3SalesPlan({ onNext, onBack }: Step3SalesPlanProps) {
  const { data: existingData, isLoading } = useSalesPlanQuery();
  const upsertMutation = useUpsertSalesPlan();

  const form = useForm<SalesPlanFormData>({
    resolver: zodResolver(salesPlanSchema),
    defaultValues: {
      yearMinus3Value: 0,
      yearMinus2Value: 0,
      yearMinus1Value: 0,
      projectedYearValue: 0,
      monthlyContribution: defaultContribution,
      averageTicketSize: 25000,
      conversionRatio: 20,
      existingCustomerContribution: 40,
      newCustomerContribution: 60,
    },
  });

  const monthlyContribution = form.watch("monthlyContribution") ?? defaultContribution;
  const projectedYearValue = Number(form.watch("projectedYearValue")) || 0;
  const averageTicketSize = Number(form.watch("averageTicketSize")) || 0;
  const conversionRatio = Number(form.watch("conversionRatio")) || 0;
  const existingContribution = Number(form.watch("existingCustomerContribution")) || 0;
  const newContribution = Number(form.watch("newCustomerContribution")) || 0;

  const contributionSum = monthlyContribution.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
  const customerContributionSum = existingContribution + newContribution;
  const monthlyTargets = calculateMonthlyRevenue(projectedYearValue, monthlyContribution);
  const monthlyOrderTargets = monthlyTargets.map((target) =>
    averageTicketSize > 0 ? Math.ceil(target / averageTicketSize) : 0,
  );
  const monthlyLeadTargets = monthlyOrderTargets.map((orders) =>
    conversionRatio > 0 ? Math.ceil(orders / (conversionRatio / 100)) : 0,
  );
  const annualOrders = monthlyOrderTargets.reduce((total, value) => total + value, 0);
  const annualLeads = monthlyLeadTargets.reduce((total, value) => total + value, 0);
  const existingTarget = (projectedYearValue * existingContribution) / 100;
  const newTarget = (projectedYearValue * newContribution) / 100;
  const monthlyContributionValid = Math.abs(contributionSum - 100) < 0.01;
  const customerContributionValid = Math.abs(customerContributionSum - 100) < 0.01;

  useEffect(() => {
    if (existingData) {
      form.reset({
        yearMinus3Value: existingData.yearMinus3Value ?? 0,
        yearMinus2Value: existingData.yearMinus2Value ?? 0,
        yearMinus1Value: existingData.yearMinus1Value ?? 0,
        projectedYearValue: existingData.projectedYearValue ?? 0,
        monthlyContribution: existingData.monthlyContribution ?? defaultContribution,
        averageTicketSize: existingData.averageTicketSize ?? 25000,
        conversionRatio: existingData.conversionRatio ?? 20,
        existingCustomerContribution: existingData.existingCustomerContribution ?? 40,
        newCustomerContribution: existingData.newCustomerContribution ?? 60,
      });
    }
  }, [existingData, form]);

  const onSubmit = async (data: SalesPlanFormData) => {
    await upsertMutation.mutateAsync({
      yearMinus3Value: data.yearMinus3Value,
      yearMinus2Value: data.yearMinus2Value,
      yearMinus1Value: data.yearMinus1Value,
      projectedYearValue: data.projectedYearValue,
      monthlyContribution: data.monthlyContribution,
      averageTicketSize: data.averageTicketSize,
      conversionRatio: data.conversionRatio,
      existingCustomerContribution: data.existingCustomerContribution,
      newCustomerContribution: data.newCustomerContribution,
    });
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue History
            </CardTitle>
            <CardDescription>Enter actual revenue for the last 3 financial years.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="yearMinus3Value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 1 (oldest)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500000" {...field} />
                  </FormControl>
                  <FormDescription>Two years back</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearMinus2Value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 2</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="750000" {...field} />
                  </FormControl>
                  <FormDescription>Last year</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearMinus1Value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 3 (recent)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000000" {...field} />
                  </FormControl>
                  <FormDescription>Current or most recent year</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Annual Target
            </CardTitle>
            <CardDescription>Set the revenue target the rest of the plan should support.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="projectedYearValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual sales target *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1200000" {...field} />
                  </FormControl>
                  <FormDescription>
                    {projectedYearValue > 0 ? `Target: ${formatCurrency(projectedYearValue)}` : "Enter the yearly sales goal."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              ASP / Conversion Calculator
            </CardTitle>
            <CardDescription>
              Convert the target into the orders and leads needed to make it real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="averageTicketSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average ticket size / ATS *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25000" {...field} />
                    </FormControl>
                    <FormDescription>Average value of one sale or transaction.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conversionRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversion ratio % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0.01" max="100" placeholder="20" {...field} />
                    </FormControl>
                    <FormDescription>Out of 100 leads, how many usually become customers?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <CalculatorCard title="Annual orders needed" value={annualOrders} />
              <CalculatorCard title="Annual leads needed" value={annualLeads} />
              <CalculatorCard title="Average monthly orders" value={Math.ceil(annualOrders / 12)} />
              <CalculatorCard title="Average monthly leads" value={Math.ceil(annualLeads / 12)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Customer Contribution
            </CardTitle>
            <CardDescription>Split the target between existing customers and new customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!customerContributionValid && customerContributionSum > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Existing and new contribution total is {customerContributionSum}%. Adjust it to 100%.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="existingCustomerContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing customer contribution % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>{formatCurrency(existingTarget)} from existing customers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newCustomerContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New customer contribution % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>{formatCurrency(newTarget)} from new customers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Monthly Distribution
            </CardTitle>
            <CardDescription>
              Allocate the annual target across months. Each month shows revenue, orders, and leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!monthlyContributionValid && contributionSum > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Monthly total is {contributionSum}%. Adjust the months to total 100%.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {MONTHS.map((month, index) => (
                <FormField
                  key={month}
                  control={form.control}
                  name={`monthlyContribution.${index}`}
                  render={({ field }) => (
                    <FormItem className="space-y-1 rounded-md border p-3">
                      <FormLabel className="text-sm font-medium">{month}</FormLabel>
                      <div className="flex items-center gap-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            className="h-9 w-20"
                            value={field.value}
                            onChange={(event) => {
                              const next = event.target.value === "" ? 0 : Number(event.target.value);
                              field.onChange(Number.isNaN(next) ? 0 : next);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <span className="text-sm font-medium text-muted-foreground">%</span>
                      </div>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p>{formatCurrency(monthlyTargets[index] ?? 0)}</p>
                        <p>{monthlyOrderTargets[index] ?? 0} orders</p>
                        <p>{monthlyLeadTargets[index] ?? 0} leads</p>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="font-medium">Monthly allocation total</span>
              <span className={`font-bold ${monthlyContributionValid ? "text-green-600" : "text-red-600"}`}>
                {contributionSum}%
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={upsertMutation.isPending || !monthlyContributionValid || !customerContributionValid}
            className="min-w-[150px]"
          >
            {upsertMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CalculatorCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{Number.isFinite(value) ? value : 0}</p>
    </div>
  );
}
