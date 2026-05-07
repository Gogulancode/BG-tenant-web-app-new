import { LogOut, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPageTitle = (pathname: string) => {
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/metrics": "Metrics",
    "/outcomes": "Weekly Outcomes",
    "/sales": "Sales Planning & Tracking",
    "/reviews": "Reviews",
    "/insights": "Insights",
    "/activities": "Activities",
    "/settings": "Settings",
    "/settings/mfa": "MFA Settings",
    "/settings/sessions": "Active Sessions",
    "/users": "User Management",
    "/templates": "Templates",
    "/reports": "Reports",
    "/support": "Support",
    "/notifications": "Notifications",
  };
  return titles[pathname] || "Dashboard";
};

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const week = Math.ceil(diff / oneWeek);
  return `Week ${week}, ${now.getFullYear()}`;
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);
  const weekLabel = getCurrentWeek();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{weekLabel}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              JD
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
