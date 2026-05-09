import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { PublicOnlyRoute } from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Today = lazy(() => import("./pages/Today"));
const Metrics = lazy(() => import("./pages/Metrics"));
const Outcomes = lazy(() => import("./pages/Outcomes"));
const Sales = lazy(() => import("./pages/Sales"));
const Activities = lazy(() => import("./pages/Activities"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Insights = lazy(() => import("./pages/Insights"));
const Settings = lazy(() => import("./pages/Settings"));
const MfaSettings = lazy(() => import("./pages/MfaSettings"));
const Sessions = lazy(() => import("./pages/Sessions"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Templates = lazy(() => import("./pages/Templates"));
const Reports = lazy(() => import("./pages/Reports"));
const Support = lazy(() => import("./pages/Support"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
