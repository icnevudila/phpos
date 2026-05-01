import { Navigate, Outlet, useParams } from "react-router-dom";

import { hasPortalToken } from "./services/portalApi";
import { usePortalKioskSuffix } from "./usePortalKioskSuffix";

export function PortalProtectedRoute(): JSX.Element {
  const { slug = "" } = useParams();
  const kioskSuffix = usePortalKioskSuffix();
  if (!hasPortalToken()) {
    return <Navigate to={`/${slug}/portal/login${kioskSuffix}`} replace />;
  }
  return <Outlet />;
}
