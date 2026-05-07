import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { TrialBanner } from "@/components/TrialBanner";
import { useTokenAutoRefresh } from "@/hooks/useTokenAutoRefresh";

const DashboardLayout = () => {
  useTokenAutoRefresh();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TrialBanner />
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
