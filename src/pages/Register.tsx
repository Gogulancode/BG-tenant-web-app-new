import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "../lib/api";
import { saveAuthSession } from "../lib/auth-session";
import { Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BUSINESS_TYPES = [
  { value: "Solopreneur", label: "Solopreneur" },
  { value: "Startup", label: "Startup" },
  { value: "MSME", label: "MSME (Small/Medium Business)" },
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Password validation: min 10 chars, uppercase, lowercase, number, symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Error",
        description: "Password must be at least 10 characters with uppercase, lowercase, number, and symbol",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessType) {
      toast({
        title: "Error",
        description: "Please select your business type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        businessType: formData.businessType,
      });

      // Auto-login after registration
      saveAuthSession(data);

      toast({
        title: "Success!",
        description: "Account created successfully. Starting onboarding...",
      });

      // Redirect to onboarding
      window.location.href = "/onboarding";
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Green Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground relative p-16">
        <div className="flex flex-col justify-between w-full">
          {/* Top Section */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-12">
              <Target className="w-12 h-12 text-white" />
            </div>

            {/* Text */}
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Start Your<br />
              Accountability Journey
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              Create your account and begin tracking your momentum, achieving outcomes, 
              and building consistent execution habits. Your path to business growth starts here!
            </p>
          </div>

          {/* Bottom Copyright */}
          <div className="text-white/80 text-sm">
            © 2025 Babaji Shivram. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img 
              src="/bridge_gaps_TM.png" 
              alt="Bridging Gaps" 
              className="h-16 w-auto"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground">Join BG Accountability Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Min 10 characters with uppercase, lowercase, number, and symbol
              </p>
            </div>

            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => setFormData({ ...formData, businessType: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:underline"
              >
                Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
