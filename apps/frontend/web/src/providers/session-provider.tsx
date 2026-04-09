import type { AuthSession } from "#/lib/auth";
import { useBetterAuthSession } from "#/lib/auth";
import { createContext, useContext, type ReactNode } from "react";
import { useIsMounted } from "@yourcompany/web/hooks/is-mounted";

type SessionContextType = {
  isPending: boolean;
  data: AuthSession | null;
};

const SessionContext = createContext<SessionContextType | null>(null);

const SESSION_STORAGE_KEY = "yourcompany_session_data";

const getStoredSession = (): AuthSession | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredSession = (session: AuthSession | null) => {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore sessionStorage errors
  }
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    const storedSession = typeof window !== "undefined" ? getStoredSession() : null;
    return (
      <SessionContext.Provider value={{ isPending: !storedSession, data: storedSession }}>
        {children}
      </SessionContext.Provider>
    );
  }

  return <MountedSessionProvider>{children}</MountedSessionProvider>;
}

function MountedSessionProvider({ children }: { children: ReactNode }) {
  const { isPending, data: betterAuthData } = useBetterAuthSession();
  const data = betterAuthData ?? null;

  // Persist session for navigation persistence (idempotent write, safe during render)
  if (!isPending) {
    setStoredSession(data);
  }

  return (
    <SessionContext.Provider value={{ isPending, data: isPending ? getStoredSession() : data }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}
