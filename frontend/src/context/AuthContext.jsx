import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("studyvault_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiRequest("/auth/me");
      setUser(data.user || data.data?.user || data);
    } catch {
      localStorage.removeItem("studyvault_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUser(); }, []);

  async function login(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const token = data.token || data.data?.token;
    if (!token) throw new Error("Login succeeded but no token was returned.");
    localStorage.setItem("studyvault_token", token);
    await loadUser();
    return data;
  }

  async function register(name, email, password) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
  }

  function logout() {
    localStorage.removeItem("studyvault_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}