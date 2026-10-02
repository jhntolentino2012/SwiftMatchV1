import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "./pages/landing";
import ApplicationFlow from "./pages/application-flow";
import ApplicantDashboard from "./pages/dashboard";
import EmployerPortal from "./pages/employerportal";
import AssessmentCenter from "./pages/assessment-center";
import CustomAssessment from "./pages/customassessment";
import ResultsPage from "./pages/results";
import JobsPage from "./pages/jobs";
import SignupPage from "./pages/signup";
import SigninPage from "./pages/signin";
import ForgotPassword from "./pages/forgotpassword";
import ResetPassword from "./pages/resetpassword";
import ResetConfirmed from "./pages/resetconfirmed";
import ProfilePage from "./pages/profile";
import EmployerOnboarding from "./pages/employer-onboarding";
import CandidatePage from "./pages/candidates";
import CVFlow from "./pages/cvflow";
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
      <Route path="/jobs" component={JobsPage} />
      <Route path="/assessment-center" component={AssessmentCenter} />
      <Route path="/customassessment" component={CustomAssessment} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/signin" component={SigninPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/email-confirmed" component={ResetConfirmed} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/employer/onboarding" component={EmployerOnboarding} />
      <Route path="/candidates/:id" component={CandidatePage} />
      <Route path="/cvflow" component={CVFlow} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
