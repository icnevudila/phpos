import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/user";

export function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: JSX.Element;
}): JSX.Element {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;

  const userRole = user?.user_metadata?.role as UserRole | undefined;

  if (!user || !userRole || !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export interface ProtectedRouteProps {
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps): JSX.Element {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles !== undefined && roles.length > 0) {
    const userRole = user?.user_metadata?.role as UserRole | undefined;
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
