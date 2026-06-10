"use client";

import React from "react";
import {
  ADMIN_SESSION_CHANGED_EVENT,
  clearAdminSession,
  getAdminSession,
  type AdminSession,
} from "@/lib/admin/admin-session";

type AdminModeContextValue = {
  session: AdminSession | null;
  isAdmin: boolean;
  accessToken: string | null;
  refreshSession: () => void;
  logout: () => void;
};

const AdminModeContext = React.createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AdminSession | null>(null);

  const refreshSession = React.useCallback(() => {
    setSession(getAdminSession());
  }, []);

  const logout = React.useCallback(() => {
    clearAdminSession();
    setSession(null);
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  React.useEffect(() => {
    function handleSessionChange() {
      refreshSession();
    }

    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener("storage", handleSessionChange);

    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleSessionChange);
    };
  }, [refreshSession]);

  return (
    <AdminModeContext.Provider
      value={{
        session,
        isAdmin: session?.user.role === "ADMIN",
        accessToken: session?.accessToken ?? null,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = React.useContext(AdminModeContext);

  if (!context) {
    throw new Error("useAdminMode must be used inside AdminModeProvider.");
  }

  return context;
}
