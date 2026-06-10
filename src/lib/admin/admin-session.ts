const ADMIN_SESSION_KEY = "festival-desapegue-se-admin-session";
export const ADMIN_SESSION_CHANGED_EVENT = "festival-desapegue-se-admin-session-changed";

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  };
};

function notifyAdminSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;

  if (session.user.role !== "ADMIN") {
    clearAdminSession();
    return;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  notifyAdminSessionChanged();
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    return parsed.user.role === "ADMIN" ? parsed : null;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  notifyAdminSessionChanged();
}
