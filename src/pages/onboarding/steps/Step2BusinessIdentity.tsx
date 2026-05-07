import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, Factory, Target, Users } from "lucide-react";
import { useBusinessIdentityQuery, useUpsertBusinessIdentity } from "@/hooks/useOnboarding";
import {
  BusinessRegistrationStatus,
  CompanyType,
  CustomerType,
  EmployeeRange,
  Industry,
  OfferingType,
  TurnoverBand,
} from "@/lib/api";

const businessIdentitySchema = z.object({
  companyName: z.string().min(2, "Enter your business name").max(200, "Too long"),
  companyType: z.string().optional(),
  customerType: z.string({ required_error: "Select who you sell to" }),
  registrationStatus: z.string({ required_error: "Select registration status" }),
  offeringType: z.string({ required_error: "Select what you sell" }),
  industry: z.string({ required_error: "Please select industry" }),
  industryOther: z.string().max(100, "Too long").optional(),
  businessAge: z.coerce.number().min(0, "Must be 0 or more").max(200, "Invalid value").optional(),
  turnoverBand: z.string().optional(),
  employeeRange: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Describe what your business does").max(1000, "Too long"),
  usp: z.string().max(500, "Too long").optional(),
  keywordsText: z.string().max(240, "Keep keywords short").optional(),
  offeringsText: z.string().max(600, "Keep offerings concise").optional(),
});

type BusinessIdentityFormData = z.infer<typeof businessIdentitySchema>;

const COMPANY_TYPE_LABELS: Record<string, string> = {
  [CompanyType.SOLE_PROPRIETORSHIP]: "Sole Proprietorship",
  [CompanyType.PARTNERSHIP]: "Partnership",
  [CompanyType.LLC]: "LLC",
  [CompanyType.CORPORATION]: "Corporation",
  [CompanyType.NON_PROFIT]: "Non-Profit",
  [CompanyType.COOPERATIVE]: "Cooperative",
  [CompanyType.OTHER]: "Other",
};

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  [CustomerType.B2B]: "B2B - Businesses",
  [CustomerType.B2C]: "B2C - Consumers",
  [CustomerType.BOTH]: "Both B2B and B2C",
};

const REGISTRATION_LABELS: Record<string, string> = {
  [BusinessRegistrationStatus.REGISTERED]: "Registered",
  [BusinessRegistrationStatus.UNREGISTERED]: "Not registered yet",
  [BusinessRegistrationStatus.IN_PROGRESS]: "Registration in progress",
};

const OFFERING_LABELS: Record<string, string> = {
  [OfferingType.PRODUCT]: "Products",
  [OfferingType.SERVICE]: "Services",
  [OfferingType.BOTH]: "Products and services",
};

const INDUSTRY_LABELS: Record<string, string> = {
  [Industry.TECHNOLOGY]: "Technology",
  [Industry.HEALTHCARE]: "Healthcare",
  [Industry.FINANCE]: "Finance",
  [Industry.RETAIL]: "Retail",
  [Industry.MANUFACTURING]: "Manufacturing",
  [Industry.EDUCATION]: "Education",
  [Industry.REAL_ESTATE]: "Real Estate",
  [Industry.HOSPITALITY]: "Hospitality",
  [Industry.CONSULTING]: "Consulting",
  [Industry.MARKETING]: "Marketing",
  [Industry.CONSTRUCTION]: "Construction",
  [Industry.TRANSPORTATION]: "Transportation",
  [Industry.AGRICULTURE]: "Agriculture",
  [Industry.ENTERTAINMENT]: "Entertainment",
  [Industry.OTHER]: "Other",
};

const TURNOVER_LABELS: Record<string, string> = {
  [TurnoverBand.UNDER_1L]: "Under 1L",
  [TurnoverBand.L1_TO_5L]: "1L to 5L",
  [TurnoverBand.L5_TO_10L]: "5L to 10L",
  [TurnoverBand.L10_TO_25L]: "10L to 25L",
  [TurnoverBand.L25_TO_50L]: "25L to 50L",
  [TurnoverBand.L50_TO_1CR]: "50L to 1Cr",
  [TurnoverBand.CR1_TO_5CR]: "1Cr to 5Cr",
  [TurnoverBand.CR5_TO_10CR]: "5Cr to 10Cr",
  [TurnoverBand.ABOVE_10CR]: "Above 10Cr",
};

const EMPLOYEE_LABELS: Record<string, string> = {
  [EmployeeRange.SOLO]: "Solo (just me)",
  [EmployeeRange.MICRO]: "Micro (2-5)",
  [EmployeeRange.SMALL]: "Small (6-20)",
  [EmployeeRange.MEDIUM]: "Medium (21-50)",
  [EmployeeRange.LARGE]: "Large (51-200)",
  [EmployeeRange.ENTERPRISE]: "Enterprise (200+)",
};

interface Step2BusinessIdentityProps {
  onNext: () => void;
  onBack: () => void;
}

function splitList(value?: string) {
  return (value ?? "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function Step2BusinessIdentity({ onNext, onBack }: Step2BusinessIdentityProps) {
  const { data: existingData, isLoading } = useBusinessIdentityQuery();
  const upsertMutation = useUpsertBusinessIdentity();

  const form = useForm<BusinessIdentityFormData>({
    resolver: zodResolver(businessIdentitySchema),
    defaultValues: {
      companyName: "",
      companyType: undefined,
      customerType: undefined,
      registrationStatus: undefined,
      offeringType: undefined,
      industry: undefined,
      industryOther: "",
      businessAge: undefined,
      turnoverBand: undefined,
      employeeRange: undefined,
      website: "",
      description: "",
      usp: "",
      keywordsText: "",
      offeringsText: "",
    },
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        companyName: existingData.companyName ?? "",
        companyType: existingData.companyType,
        customerType: existingData.customerType,
        registrationStatus: existingData.registrationStatus,
        offeringType: existingData.offeringType,
        industry: existingData.industry,
        industryOther: existingData.industryOther ?? "",
        businessAge: existingData.businessAge ?? undefined,
        turnoverBand: existingData.turnoverBand,
        employeeRange: existingData.employeeRange,
        website: existingData.website ?? "",
        description: existingData.description ?? "",
        usp: existingData.usp ?? "",
        keywordsText: existingData.keywords?.join(", ") ?? "",
        offeringsText: existingData.offerings?.join("\n") ?? "",
      });
    }
  }, [existingData, form]);

  const onSubmit = async (data: BusinessIdentityFormData) => {
    await upsertMutation.mutateAsync({
      companyName: data.companyName.trim(),
      companyType: data.companyType as CompanyType | undefined,
      customerType: data.customerType as CustomerType,
      registrationStatus: data.registrationStatus as BusinessRegistrationStatus,
      offeringType: data.offeringType as OfferingType,
      industry: data.industry as Industry,
      industryOther: data.industry === Industry.OTHER ? data.industryOther?.trim() : undefined,
      businessAge: data.businessAge,
      turnoverBand: data.turnoverBand as TurnoverBand | undefined,
      employeeRange: data.employeeRange as EmployeeRange | undefined,
      website: data.website || undefined,
      description: data.description.trim(),
      usp: data.usp?.trim() || undefined,
      keywords: splitList(data.keywordsText),
      offerings: splitList(data.offeringsText),
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
              <Building2 className="h-5 w-5" />
              Business Identity
            </CardTitle>
            <CardDescription>
              Start with the core facts that shape your accountability plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Bridge Gaps Studio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registered status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(REGISTRATION_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who do you sell to? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Products & Services
            </CardTitle>
            <CardDescription>
              Tell the app what you offer so sales planning can speak your language.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="offeringType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you sell? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offering type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OFFERING_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("industry") === Industry.OTHER && (
              <FormField
                control={form.control}
                name="industryOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry name</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your industry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="offeringsText"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product/service catalog</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={"Business Owner Review\nSales Excellence Workshop\nProductivity Review"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter one offering per line or separate with commas.</FormDescription>
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
              Positioning
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Business description *</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="What you do, for whom, and the result you create" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USP</FormLabel>
                  <FormControl>
                    <Input placeholder="Why customers choose you" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywordsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="sales, coaching, productivity" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated tags for later reports and recommendations.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Operating Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="businessAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in business</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="turnoverBand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approx sales turnover</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select turnover band" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TURNOVER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(EMPLOYEE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://yourwebsite.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={upsertMutation.isPending} className="min-w-[150px]">
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
