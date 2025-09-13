import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";


class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error?: any }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <pre className="text-sm text-muted-foreground overflow-auto max-w-xl max-h-64 text-left">
              {String(this.state.error)}
            </pre>
            <button className="mt-4 underline" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

function RouteLogger({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // eslint-disable-next-line no-console
  console.log('[RouteLogger] location', { pathname: location.pathname, search: location.search });
  return <>{children}</>;
}

const App = () => {
  console.log('[App] Component rendering');
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="nexus-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <HashRouter>
              <RouteLogger>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/search" element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteLogger>
            </HashRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
