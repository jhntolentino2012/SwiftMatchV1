import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "./pages/Landing";
import ApplicationFlow from "./pages/ApplicationFlow";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import EmployerPortal from "./pages/EmployerPortal";
import AssessmentCenter from "./pages/AssessmentCenter";
import CustomAssessment from "./pages/CustomAssessment";
import ResultsPage from "./pages/Results";
import JobsPage from "./pages/Jobs";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmed from "./pages/EmailConfirmed";
import ProfilePage from "./pages/Profile";
import EmployerOnboarding from "./pages/EmployerOnboarding";
import CandidatePage from "./pages/Candidate";
import CVFlow from "./pages/CVFlow";
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
      <Route path="/employer" component={EmployerPortal} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/assessment" component={AssessmentCenter} />
      <Route path="/custom-assessment" component={CustomAssessment} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/email-confirmed" component={EmailConfirmed} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/employer/onboarding" component={EmployerOnboarding} />
      <Route path="/candidate/:id" component={CandidatePage} />
      <Route path="/cv" component={CVFlow} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
