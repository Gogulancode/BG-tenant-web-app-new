import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { PublicOnlyRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Metrics from "./pages/Metrics";
import Outcomes from "./pages/Outcomes";
import Sales from "./pages/Sales";
import Activities from "./pages/Activities";
import Reviews from "./pages/Reviews";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import MfaSettings from "./pages/MfaSettings";
import Sessions from "./pages/Sessions";
import UserManagement from "./pages/UserManagement";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route
            path="/onboarding"
            element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/today" element={<Today />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/outcomes" element={<Outcomes />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/mfa" element={<MfaSettings />} />
            <Route path="/settings/sessions" element={<Sessions />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/support" element={<Support />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
