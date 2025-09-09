import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  // eslint-disable-next-line no-console
  console.log('[ProtectedRoute] render', { loading, hasUser: Boolean(user) });

  if (loading) {
    // eslint-disable-next-line no-console
    console.log('[ProtectedRoute] loading: true → show spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // eslint-disable-next-line no-console
    console.warn('[ProtectedRoute] no user → redirect to /login');
    // Hard fallback to avoid stuck state during refresh
    if (typeof window !== 'undefined' && window.location.hash !== '#/login') {
      setTimeout(() => {
        if (window.location.hash !== '#/login') {
          window.location.replace('/#/login');
        }
      }, 0);
    }
    return <Navigate to="/login" replace />;
  }

  // eslint-disable-next-line no-console
  console.log('[ProtectedRoute] authenticated → render children');
  return <>{children}</>;
}