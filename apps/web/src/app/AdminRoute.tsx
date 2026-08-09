import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../features/admin/context/AdminAuthContext";

/**
 * AdminRoute — wraps protected /admin/* routes.
 * Redirects to /admin/login when the user is not authenticated.
 */
const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
