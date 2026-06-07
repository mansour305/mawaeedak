import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/hooks/useStore";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";

// Pages
import SplashScreen from "@/pages/SplashScreen";
import WelcomePage from "@/pages/WelcomePage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import DisclaimerPage from "@/pages/DisclaimerPage";
import SupportPage from "@/pages/SupportPage";
import ReferenceClonePage from "@/pages/ReferenceClonePage";
import AdminSelfTestPage from "@/pages/AdminSelfTestPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import AuthPage from "@/pages/AuthPage";
import MorePage from "@/pages/MorePage";

import HomePage from "@/features/home/HomePage";
import CalendarPage from "@/features/calendar/CalendarPage";
import FinancePage from "@/features/finance/FinancePage";
import CentersPage from "@/features/centers/CentersPage";
import AccountPage from "@/features/account/AccountPage";
import StoryPage from "@/features/story/StoryPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";

import CentersWorkPage from "@/features/centers/CentersWorkPage";
import CentersTravelPage from "@/features/centers/CentersTravelPage";
import CentersStudyPage from "@/features/centers/CentersStudyPage";
import CentersNewsPage from "@/features/centers/CentersNewsPage";
import CentersJobsPage from "@/features/centers/CentersJobsPage";
import CentersGreetingsPage from "@/features/centers/CentersGreetingsPage";
import CentersComplaintsPage from "@/features/centers/CentersComplaintsPage";

// Admin
import AdminLayout from "@/features/admin/AdminLayout";
import AdminDashboard from "@/features/admin/AdminDashboard";
import AdminMessages from "@/features/admin/AdminMessages";
import AdminEvents from "@/features/admin/AdminEvents";
import AdminFinancial from "@/features/admin/AdminFinancial";
import AdminThemes from "@/features/admin/AdminThemes";
import AdminNotifications from "@/features/admin/AdminNotifications";
import AdminNewsJobs from "@/features/admin/AdminNewsJobs";
import AdminReports from "@/features/admin/AdminReports";
import AdminComplaints from "@/features/admin/AdminComplaints";
import AdminSocial from "@/features/admin/AdminSocial";
import AdminMembers from "@/features/admin/AdminMembers";
import AdminPermissions from "@/features/admin/AdminPermissions";
import AdminStory from "@/features/admin/AdminStory";
import AdminDataLayer from "@/features/admin/AdminDataLayer";
import AdminAutomation from "@/features/admin/AdminAutomation";
import AdminVisualGuide from "@/features/admin/AdminVisualGuide";
import AdminSettings from "@/features/admin/AdminSettings";
import AdminSupport from "@/features/admin/AdminSupport";
import AdminOfficialFinancial from "@/features/admin/AdminOfficialFinancial";
import AdminOfficialPrayer from "@/features/admin/AdminOfficialPrayer";
import { AdminRuntimeBoundary } from "@/features/admin/AdminRuntimeBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useTheme(); // Init theme engine
  return <>{children}</>;
}

function MainApp() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/finance" component={FinancePage} />
      <Route path="/salaries" component={FinancePage} />
      <Route path="/centers" component={CentersPage} />
      <Route path="/services" component={CentersPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/story" component={StoryPage} />
      <Route path="/notifications" component={NotificationsPage} />
      
      <Route path="/centers/work" component={CentersWorkPage} />
      <Route path="/centers/travel" component={CentersTravelPage} />
      <Route path="/centers/study" component={CentersStudyPage} />
      <Route path="/centers/news" component={CentersNewsPage} />
      <Route path="/centers/jobs" component={CentersJobsPage} />
      <Route path="/centers/greetings" component={CentersGreetingsPage} />
      <Route path="/centers/complaints" component={CentersComplaintsPage} />
      <Route path="/centers/story" component={StoryPage} />

      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/login">{() => <AuthPage mode="login" />}</Route>
      <Route path="/register">{() => <AuthPage mode="signup" />}</Route>
      <Route path="/forgot-password">{() => <AuthPage mode="forgot" />}</Route>
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/auth/callback" component={AuthCallbackPage} />
      <Route path="/more" component={MorePage} />
      <Route path="/visual-reference-clone" component={ReferenceClonePage} />
      <Route path="/admin-self-test" component={AdminSelfTestPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <AdminRuntimeBoundary>
      <AdminLayout>
      <WouterRouter base="/admin">
        <Switch>
          <Route path="/" component={AdminDashboard} />
          <Route path="/dashboard" component={AdminDashboard} />
          <Route path="/members" component={AdminMembers} />
          <Route path="/events" component={AdminEvents} />
          <Route path="/financial" component={AdminFinancial} />
          <Route path="/official-financial" component={AdminOfficialFinancial} />
          <Route path="/official-prayer" component={AdminOfficialPrayer} />
          <Route path="/messages" component={AdminMessages} />
          <Route path="/story" component={AdminStory} />
          <Route path="/themes" component={AdminThemes} />
          <Route path="/notifications" component={AdminNotifications} />
          <Route path="/news-jobs" component={AdminNewsJobs} />
          <Route path="/complaints" component={AdminComplaints} />
          <Route path="/social" component={AdminSocial} />
          <Route path="/reports" component={AdminReports} />
          <Route path="/permissions" component={AdminPermissions} />
          <Route path="/settings" component={AdminSettings} />
          <Route path="/support" component={AdminSupport} />
          <Route path="/data-layer" component={AdminDataLayer} />
          <Route path="/automation" component={AdminAutomation} />
          <Route path="/visual-guide" component={AdminVisualGuide} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
      </AdminLayout>
    </AdminRuntimeBoundary>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/splash" component={SplashScreen} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/:rest*" component={AdminRouter} />
      <Route path="/*" component={MainApp} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <ThemeWrapper>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </ThemeWrapper>
        </StoreProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
