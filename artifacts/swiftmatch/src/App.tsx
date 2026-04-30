import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "./pages/Landing";
import ApplicationFlow from "./pages/ApplicationFlow";
import ApplicantDashboard from "./pages/Dashboard";
import EmployerPortal from "./pages/EmployerPortal";
import AssessmentCenter from "./pages/Assessment";
import ResultsPage from "./pages/Results";
import JobsPage from "./pages/Jobs";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
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
      <Route path="/results" component={ResultsPage} />
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/email-confirmed" component={EmailConfirmed} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
