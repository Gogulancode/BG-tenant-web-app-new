import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  BarChart3, 
  Target, 
  DollarSign, 
  FileText, 
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  FileCode,
  PieChart,
  HelpCircle,
  CalendarCheck,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Daily",
    items: [
      { icon: Sun, label: "Today", path: "/today" },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    title: "Plan & Track",
    items: [
      { icon: Target, label: "Outcomes", path: "/outcomes" },
      { icon: BarChart3, label: "Metrics", path: "/metrics" },
      { icon: DollarSign, label: "Sales", path: "/sales" },
    ],
  },
  {
    title: "Reflect",
    items: [
      { icon: Lightbulb, label: "Insights", path: "/insights" },
      { icon: FileText, label: "Reviews", path: "/reviews" },
    ],
  },
  {
    title: "Configure",
    items: [
      { icon: FileCode, label: "Templates", path: "/templates" },
      { icon: Users, label: "Users", path: "/users" },
      { icon: PieChart, label: "Reports", path: "/reports" },
    ],
  },
  {
    title: "Help",
    items: [
      { icon: HelpCircle, label: "Support", path: "/support" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} border-r border-border bg-card flex flex-col transition-all duration-300 relative`}>
      <div className={`p-6 border-b border-border ${!isOpen && 'px-4'}`}>
        {isOpen ? (
          <img 
            src="/bridge_gaps_TM.png" 
            alt="Bridging Gaps" 
            className="h-12 w-auto"
          />
        ) : (
          <div className="h-12 flex items-center justify-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              BG
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {isOpen && (
                <h3 className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
                  {group.title}
                </h3>
              )}
              {!isOpen && (
                <div className="h-px bg-border mx-2 mb-2" />
              )}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!isOpen && 'flex-col gap-1 px-2 py-2'}`}
                      activeClassName="bg-primary/10 text-primary font-medium hover:bg-primary/15"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isOpen ? (
                        <span>{item.label}</span>
                      ) : (
                        <span className="text-[9px] font-medium truncate w-full text-center leading-tight">
                          {item.label.length > 8 ? item.label.slice(0, 7) + '…' : item.label}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 bg-card border border-border rounded-full h-6 w-6 shadow-md hover:bg-muted z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
};

export default Sidebar;
