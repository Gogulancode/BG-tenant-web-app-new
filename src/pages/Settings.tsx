import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
} from "../lib/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, ChevronRight, Loader2, User, Building, Bell, CreditCard, Crown, Zap, Check, Globe, Linkedin, Twitter, Instagram, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Subscription plan details
const PLAN_DETAILS: Record<string, { name: string; price: string; features: string[]; color: string }> = {
  FREE: {
    name: "Free",
    price: "₹0/month",
    features: ["5 users", "10 metrics", "50 activities", "Basic support"],
    color: "bg-gray-100 text-gray-800",
  },
  STARTER: {
    name: "Starter",
    price: "₹999/month",
    features: ["10 users", "25 metrics", "100 activities", "Email support"],
    color: "bg-blue-100 text-blue-800",
  },
  PRO: {
    name: "Pro",
    price: "₹2,499/month",
    features: ["25 users", "Unlimited metrics", "Unlimited activities", "Priority support"],
    color: "bg-purple-100 text-purple-800",
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited users", "Unlimited everything", "Dedicated support", "Custom integrations"],
    color: "bg-amber-100 text-amber-800",
  },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  TRIAL: { label: "Trial", variant: "secondary" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Social Handles
  const [socialHandles, setSocialHandles] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
    website: "",
  });
  const [savingSocial, setSavingSocial] = useState(false);

  // Business settings (from user profile)
  const [businessType, setBusinessType] = useState("Solopreneur");
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Subscription
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    startDate?: string;
    endDate?: string;
    trialEndsAt?: string;
    maxUsers: number;
    maxMetrics: number;
    maxActivities: number;
  } | null>(null);

  // Notifications (from settings)
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profile, settings] = await Promise.all([
          getProfile().catch(() => null),
          getSettings().catch(() => null),
        ]);

        // fill profile
        if (profile) {
          setName(profile.name || "");
          setEmail(profile.email || "");
          setBusinessType(profile.businessType || "Solopreneur");
          // Load social handles
          if (profile.socialHandles) {
            setSocialHandles({
              linkedin: profile.socialHandles.linkedin || "",
              twitter: profile.socialHandles.twitter || "",
              instagram: profile.socialHandles.instagram || "",
              website: profile.socialHandles.website || "",
            });
          }
        }

        // fill settings (notifications, timezone, subscription)
        if (settings) {
          // Handle both flat and nested response formats
          const prefs = settings.preferences || settings;
          setTimezone(prefs.timezone || settings.timezone || "Asia/Kolkata");
          setNotificationsEmail(prefs.notifications?.email ?? settings.notificationsEmail ?? true);
          setNotificationsPush(prefs.notifications?.push ?? settings.notificationsPush ?? false);
          
          // Set subscription data
          if (settings.subscription) {
            setSubscription(settings.subscription);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, email });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      await updateProfile({ businessType });
      toast({
        title: "Success",
        description: "Business type updated successfully",
      });
    } catch (error) {
      console.error("Failed to save business settings:", error);
      toast({
        title: "Error",
        description: "Failed to save business settings",
        variant: "destructive",
      });
    } finally {
      setSavingBusiness(false);
    }
  }

  async function saveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    try {
      await updateSettings({ 
        timezone,
        notificationsEmail, 
        notificationsPush 
      });
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSavingNotifications(false);
    }
  }

  async function saveSocialHandles(e: React.FormEvent) {
    e.preventDefault();
    setSavingSocial(true);
    try {
      // Filter out empty strings
      const filteredHandles: Record<string, string> = {};
      if (socialHandles.linkedin) filteredHandles.linkedin = socialHandles.linkedin;
      if (socialHandles.twitter) filteredHandles.twitter = socialHandles.twitter;
      if (socialHandles.instagram) filteredHandles.instagram = socialHandles.instagram;
      if (socialHandles.website) filteredHandles.website = socialHandles.website;
      
      await updateProfile({ socialHandles: filteredHandles });
      toast({
        title: "Success",
        description: "Social links updated successfully",
      });
    } catch (error) {
      console.error("Failed to save social links:", error);
      toast({
        title: "Error",
        description: "Failed to save social links",
        variant: "destructive",
      });
    } finally {
      setSavingSocial(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader 
          title="Settings" 
          description="Loading..."
        />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <PageHeader 
        title="Settings"
        description="Manage your profile, business details, security, and notifications."
      />

      {/* Security Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security and active sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Link
            to="/settings/mfa"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/settings/sessions"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage devices logged into your account</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* SUBSCRIPTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Your current plan and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <>
              {/* Current Plan */}
              <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-lg">
                      {PLAN_DETAILS[subscription.plan]?.name || subscription.plan} Plan
                    </span>
                    <Badge 
                      variant={STATUS_BADGES[subscription.status]?.variant || "secondary"}
                      className="ml-2"
                    >
                      {STATUS_BADGES[subscription.status]?.label || subscription.status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {PLAN_DETAILS[subscription.plan]?.price || "Custom"}
                  </p>
                  {subscription.trialEndsAt && (
                    <p className="text-sm text-muted-foreground">
                      Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  )}
                  {subscription.endDate && (
                    <p className="text-sm text-muted-foreground">
                      Renews: {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Your Plan Includes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{subscription.maxUsers}</p>
                      <p className="text-xs text-muted-foreground">Team Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{subscription.maxMetrics}</p>
                      <p className="text-xs text-muted-foreground">Metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{subscription.maxActivities}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Options */}
              {subscription.plan !== "ENTERPRISE" && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Upgrade Your Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(PLAN_DETAILS)
                      .filter(([key]) => {
                        const planOrder = ["FREE", "STARTER", "PRO", "ENTERPRISE"];
                        return planOrder.indexOf(key) > planOrder.indexOf(subscription.plan);
                      })
                      .map(([key, plan]) => (
                        <div
                          key={key}
                          className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                          onClick={() => {
                            toast({
                              title: "Upgrade Request",
                              description: `To upgrade to ${plan.name}, please contact support@bridginggaps.in`,
                            });
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{plan.name}</span>
                            <Badge className={plan.color}>{plan.price}</Badge>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {plan.features.slice(0, 2).map((feature, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Contact <a href="mailto:support@bridginggaps.in" className="text-primary hover:underline">support@bridginggaps.in</a> to upgrade your plan.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No subscription information available</p>
              <p className="text-sm">Contact support for assistance</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SOCIAL LINKS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>Your online presence and social profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSocialHandles} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={socialHandles.linkedin}
                  onChange={(e) => setSocialHandles({ ...socialHandles, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter / X
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={socialHandles.twitter}
                  onChange={(e) => setSocialHandles({ ...socialHandles, twitter: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  value={socialHandles.instagram}
                  onChange={(e) => setSocialHandles({ ...socialHandles, instagram: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={socialHandles.website}
                  onChange={(e) => setSocialHandles({ ...socialHandles, website: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={savingSocial}>
              {savingSocial && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Social Links
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* BUSINESS SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Type
          </CardTitle>
          <CardDescription>Your business classification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveBusiness} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solopreneur">Solopreneur</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                  <SelectItem value="MSME">MSME</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={savingBusiness}>
              {savingBusiness && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Business Type
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* NOTIFICATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveNotifications} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificationsEmail">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications and reminders
                  </p>
                </div>
                <Switch
                  id="notificationsEmail"
                  checked={notificationsEmail}
                  onCheckedChange={setNotificationsEmail}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificationsPush">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  id="notificationsPush"
                  checked={notificationsPush}
                  onCheckedChange={setNotificationsPush}
                />
              </div>
            </div>
            <Button type="submit" disabled={savingNotifications}>
              {savingNotifications && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Notification Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
