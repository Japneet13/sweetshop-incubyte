import { Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin, trying to access admin route
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized
  return children;
}
