import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../types/user";

export function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: JSX.Element;
}): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.user_metadata?.role) {
      setUserRole(user.user_metadata.role as UserRole);
      setLoading(false);
      return;
    }
    // Fetch from profiles
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.role) setUserRole(data.role as UserRole);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);
  
  if (authLoading || loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.user_metadata?.role) {
      setUserRole(user.user_metadata.role as UserRole);
      setLoading(false);
      return;
    }
    // Fetch from profiles
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.role) setUserRole(data.role as UserRole);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles !== undefined && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
