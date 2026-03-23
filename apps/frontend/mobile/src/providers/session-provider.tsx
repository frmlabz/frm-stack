import type { AuthSession } from "#lib/auth";
import { getAuthClient, getCachedSession, getSession } from "#lib/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SessionContextType = {
  isPending: boolean;
  data: AuthSession | null;
  refresh: () => Promise<void>;
  onAuthSuccess: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const initialCached = useMemo(() => getCachedSession(), []);
  const [data, setData] = useState<AuthSession | null>(initialCached);
  const [isPending, setIsPending] = useState<boolean>(!initialCached);

  const refresh = useCallback(async () => {
    setIsPending(true);
    const result = await getSession();
    if (result?.data) {
      setData(result.data);
    } else {
      const status = result?.error?.status;
      if (status === 401 || status === 403) {
        setData(null);
      } else {
        setData(prev => prev ?? null);
      }
    }
    setIsPending(false);
  }, []);

  const onAuthSuccess = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (!initialCached) {
      void refresh();
    } else {
      setIsPending(false);
    }
  }, [initialCached, refresh]);

  useEffect(() => {
    // Keep local state in sync with cookie updates (sign-in/out) without forcing a network call.
    const store = getAuthClient().$store;
    const sessionSignal = store.atoms.$sessionSignal;
    const unsubscribe = sessionSignal.subscribe(() => {
      setData(getCachedSession());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isPending,
        data,
        refresh,
        onAuthSuccess,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}
