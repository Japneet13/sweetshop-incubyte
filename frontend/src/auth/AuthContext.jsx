/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const AuthContext = createContext(null);

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;

    const parsed = JSON.parse(raw);

    // 🔧 normalize admin flag (snake_case → camelCase)
    return {
      ...parsed,
      isAdmin: parsed.isAdmin ?? parsed.is_admin ?? false,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeParseUser());

  const login = (data) => {
    const normalizedUser = {
      ...data.user,
      isAdmin: data.user.isAdmin ?? data.user.is_admin ?? false,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
