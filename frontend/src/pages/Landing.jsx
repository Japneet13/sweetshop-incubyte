import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-container">
        <h1 className="landing-title">🍬 Sweet Shop Management</h1>
        <p className="landing-subtitle">
          A simple, elegant system to manage and purchase sweets
        </p>

        <div className="landing-grid">
          {/* Admin Login */}
          <div className="landing-card admin-card">
            <h3>Admin Access</h3>
            <p>
              Manage sweets, inventory, and stock levels.
            </p>

            <p style={{ fontSize: "13px", color: "#555", marginBottom: "15px" }}>
              <strong> Admin Credentials:</strong><br />
              Username: <code>admin</code><br />
              Password: <code>adminpass</code>
           </p>

            <button onClick={() => navigate("/login")}>
              Admin Login
            </button>
          </div>

          {/* User Login */}
          <div className="landing-card user-login-card">
            <h3>User Login</h3>
            <p>
              Login to browse and purchase available sweets.
            </p>
            <button onClick={() => navigate("/login")}>
              User Login
            </button>
          </div>

          {/* User Register */}
          <div className="landing-card user-register-card">
            <h3>New User</h3>
            <p>
              Create an account and start buying sweets.
            </p>
            <button onClick={() => navigate("/register")}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
