import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getUser, isAuthenticated } from "../hooks/authTokens";
import type { UserRole } from "../types/user";

/** Rota bazlı rol kontrolü (`GAP-017`) */
export function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: JSX.Element;
}): JSX.Element {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export interface ProtectedRouteProps {
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps): JSX.Element {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles !== undefined && roles.length > 0) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
