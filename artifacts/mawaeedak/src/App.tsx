import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/hooks/useStore";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TopNotificationContainer } from "@/components/layout/TopNotificationBanner";

const NotFound = lazy(() => import("@/pages/not-found"));
const SplashScreen = lazy(() => import("@/pages/SplashScreen"));
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const DisclaimerPage = lazy(() => import("@/pages/DisclaimerPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const ReferenceClonePage = lazy(() => import("@/pages/ReferenceClonePage"));
const AdminSelfTestPage = lazy(() => import("@/pages/AdminSelfTestPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const MorePage = lazy(() => import("@/pages/MorePage"));

const HomePage = lazy(() => import("@/features/home/HomePage"));
const CalendarPage = lazy(() => import("@/features/calendar/CalendarPage"));
const FinancePage = lazy(() => import("@/features/finance/FinancePage"));
const CentersPage = lazy(() => import("@/features/centers/CentersPage"));
const AccountPage = lazy(() => import("@/features/account/AccountPage"));
const StoryPage = lazy(() => import("@/features/story/StoryPage"));
const DailyCardPage = lazy(() => import("@/features/daily-card/DailyCardPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/NotificationsPage"));

const CentersWorkPage = lazy(() => import("@/features/centers/CentersWorkPage"));
const CentersTravelPage = lazy(() => import("@/features/centers/CentersTravelPage"));
const CentersStudyPage = lazy(() => import("@/features/centers/CentersStudyPage"));
const CentersNewsPage = lazy(() => import("@/features/centers/CentersNewsPage"));
const CentersJobsPage = lazy(() => import("@/features/centers/CentersJobsPage"));
const CentersGreetingsPage = lazy(() => import("@/features/centers/CentersGreetingsPage"));
const CentersComplaintsPage = lazy(() => import("@/features/centers/CentersComplaintsPage"));

const AdminLayout = lazy(() => import("@/features/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/features/admin/AdminDashboard"));
const AdminMessages = lazy(() => import("@/features/admin/AdminMessages"));
const AdminEvents = lazy(() => import("@/features/admin/AdminEvents"));
const AdminFinancial = lazy(() => import("@/features/admin/AdminFinancial"));
const AdminThemes = lazy(() => import("@/features/admin/AdminThemes"));
const AdminNotifications = lazy(() => import("@/features/admin/AdminNotifications"));
const AdminNewsJobs = lazy(() => import("@/features/admin/AdminNewsJobs"));
const AdminReports = lazy(() => import("@/features/admin/AdminReports"));
const AdminComplaints = lazy(() => import("@/features/admin/AdminComplaints"));
const AdminSocial = lazy(() => import("@/features/admin/AdminSocial"));
const AdminMembers = lazy(() => import("@/features/admin/AdminMembers"));
const AdminPermissions = lazy(() => import("@/features/admin/AdminPermissions"));
const AdminStory = lazy(() => import("@/features/admin/AdminStory"));
const AdminDataLayer = lazy(() => import("@/features/admin/AdminDataLayer"));
const AdminAutomation = lazy(() => import("@/features/admin/AdminAutomation"));
const AdminVisualGuide = lazy(() => import("@/features/admin/AdminVisualGuide"));
const AdminSettings = lazy(() => import("@/features/admin/AdminSettings"));
const AdminSupport = lazy(() => import("@/features/admin/AdminSupport"));
const AdminOfficialFinancial = lazy(() => import("@/features/admin/AdminOfficialFinancial"));
const AdminOfficialPrayer = lazy(() => import("@/features/admin/AdminOfficialPrayer"));
const AdminRuntimeBoundary = lazy(() =>
  import("@/features/admin/AdminRuntimeBoundary").then((module) => ({
    default: module.AdminRuntimeBoundary,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RouteFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#FAF7F2] px-6 text-center" dir="rtl">
      <div className="rounded-3xl border border-[#C9A063]/25 bg-white/80 px-6 py-5 text-sm font-bold text-[#8A6B3D] shadow-[0_18px_48px_rgba(138,107,61,0.12)]">
        جاري تحميل مواعيدك...
      </div>
    </div>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

function AuthRoute({ mode }: { mode: "login" | "signup" | "forgot" }) {
  return <AuthPage mode={mode} />;
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
      <Route path="/daily-card" component={DailyCardPage} />
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
      <Route path="/login">{() => <AuthRoute mode="login" />}</Route>
      <Route path="/register">{() => <AuthRoute mode="signup" />}</Route>
      <Route path="/forgot-password">{() => <AuthRoute mode="forgot" />}</Route>
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
                <Suspense fallback={<RouteFallback />}>
                  <Router />
                </Suspense>
              </WouterRouter>
              <TopNotificationContainer />
              <Toaster />
            </TooltipProvider>
          </ThemeWrapper>
        </StoreProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
