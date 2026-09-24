import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api';

interface ServerStatus {
  online: boolean | null; // null while the first check runs
  recheck: () => void;
}

const ServerStatusContext = createContext<ServerStatus>({ online: null, recheck: () => {} });

export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);

  const recheck = useCallback(() => {
    api
      .health()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  useEffect(() => {
    recheck();
    // Poll quickly while offline so the app recovers as soon as the backend starts.
    const id = window.setInterval(recheck, online === false ? 3000 : 20000);
    return () => window.clearInterval(id);
  }, [recheck, online]);

  return <ServerStatusContext.Provider value={{ online, recheck }}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
}
