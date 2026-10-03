import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

import LandingPage from "./pages/Landing";
import ApplicationFlow from "./pages/ApplicationFlow";
import ApplicantDashboard from "./pages/Dashboard";
import EmployerPortal from "./pages/EmployerPortal";
import JobsPage from "./pages/Jobs";
import AssessmentCenter from "./pages/Assessment";
import CustomAssessment from "./pages/CustomAssessment";
import ResultsPage from "./pages/Results";
import SignupPage from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetConfirmed from "./pages/EmailConfirmed";
import ProfilePage from "./pages/Profile";
import EmployerOnboarding from "./pages/EmployerOnboarding";
import CandidatePage from "./pages/Candidates";
import CVFlow from "./pages/CvView";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/apply" component={ApplicationFlow} />
      <Route path="/dashboard" component={ApplicantDashboard} />
      <Route path="/employerportal" component={EmployerPortal} />
      <Route path="/employer" component={EmployerPortal} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/assessment-center" component={AssessmentCenter} />
      <Route path="/assessment" component={AssessmentCenter} />
      <Route path="/custom-assessment" component={CustomAssessment} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/signin" component={SignIn} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/email-confirmed" component={ResetConfirmed} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/employer-onboarding" component={EmployerOnboarding} />
      <Route path="/employer/onboarding" component={EmployerOnboarding} />
      <Route path="/candidates/:id" component={CandidatePage} />
      <Route path="/candidates" component={CandidatePage} />
      <Route path="/cvflow" component={CVFlow} />
      <Route path="/cv/:token" component={CVFlow} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
