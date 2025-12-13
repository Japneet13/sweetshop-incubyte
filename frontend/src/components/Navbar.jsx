import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDashboard = location.pathname === "/dashboard";
  const isAdminDashboard = location.pathname === "/admin/dashboard";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <span className="brand">🍬 SweetShop</span>

          {/* Show Dashboard link ONLY if not already there */}
          {user && !user.isAdmin && !isDashboard && (
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          )}

          {/* Show Admin Panel link ONLY if not already there */}
          {user?.isAdmin && !isAdminDashboard && (
            <Link to="/admin/dashboard" className="nav-link admin-link">
              Admin Panel
            </Link>
          )}
        </div>

        <div className="nav-right">
          {user && (
            <span className="welcome-text">
             <strong>{user.username}</strong>
            </span>
          )}

          {user && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
