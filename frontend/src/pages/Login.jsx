import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      login(res.data);

      if (res.data.user?.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">🔐 Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Standard toggle */}
          <label className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <span>Show password</span>
          </label>

          <button className="auth-btn" type="submit">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
