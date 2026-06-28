import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { useEffect } from "react";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Lectures from "@/pages/lectures";
import LectureDetail from "@/pages/lecture-detail";
import Flashcards from "@/pages/flashcards";
import FlashcardStudy from "@/pages/flashcard-study";
import Quizzes from "@/pages/quizzes";
import QuizTake from "@/pages/quiz-take";
import Assistant from "@/pages/assistant";
import Search from "@/pages/search";
import Progress from "@/pages/progress";
import Achievements from "@/pages/achievements";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const auth = localStorage.getItem("sl_auth");
    if (!auth && location !== "/login") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/">
        <AuthGuard>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthGuard>
      </Route>
      
      <Route path="/lectures">
        <AuthGuard>
          <Layout>
            <Lectures />
          </Layout>
        </AuthGuard>
      </Route>
      
      <Route path="/lectures/:id">
        <AuthGuard>
          <Layout>
            <LectureDetail />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/flashcards">
        <AuthGuard>
          <Layout>
            <Flashcards />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/flashcards/:id">
        <AuthGuard>
          <Layout>
            <FlashcardStudy />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/quizzes">
        <AuthGuard>
          <Layout>
            <Quizzes />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/quizzes/:id">
        <AuthGuard>
          <Layout>
            <QuizTake />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/assistant">
        <AuthGuard>
          <Layout>
            <Assistant />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/search">
        <AuthGuard>
          <Layout>
            <Search />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/progress">
        <AuthGuard>
          <Layout>
            <Progress />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/achievements">
        <AuthGuard>
          <Layout>
            <Achievements />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/profile">
        <AuthGuard>
          <Layout>
            <Profile />
          </Layout>
        </AuthGuard>
      </Route>

      <Route path="/settings">
        <AuthGuard>
          <Layout>
            <Settings />
          </Layout>
        </AuthGuard>
      </Route>

      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="smartlecture-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
