import React, { createContext, useContext, useState, useCallback } from "react";
import {
  login as apiLogin,
  clearToken,
  getToken,
} from "../api/auth.api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminAuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialise from localStorage so the session survives page refreshes.
  const [token, setToken] = useState<string | null>(() => getToken());

  const login = useCallback(async (email: string, password: string) => {
    const newToken = await apiLogin(email, password);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  }
  return ctx;
}
