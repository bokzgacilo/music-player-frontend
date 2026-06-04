"use client";

import type * as React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type { ConnectedClient, DownloadJob } from "@/lib/types";

type AppStreamStatus = "connecting" | "open" | "closed";

type AppStreamContextValue = {
  jobs: DownloadJob[];
  clients: ConnectedClient[];
  status: AppStreamStatus;
};

const AppStreamContext = createContext<AppStreamContextValue | undefined>(undefined);

export function AppStreamProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | undefined>(undefined);
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [status, setStatus] = useState<AppStreamStatus>("connecting");

  useEffect(() => {
    let closed = false;

    function connect() {
      setStatus("connecting");
      const socket = new WebSocket(api.appStreamUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("open");
        socket.send(JSON.stringify({ type: "client:update", path: window.location.pathname }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { type?: string; jobs?: DownloadJob[]; clients?: ConnectedClient[] };
          if (payload.type === "downloads" && payload.jobs) {
            setJobs(payload.jobs);
          }
          if (payload.type === "clients" && payload.clients) {
            setClients(payload.clients);
          }
        } catch {
          undefined;
        }
      };

      socket.onclose = () => {
        setStatus("closed");
        if (!closed) {
          reconnectTimerRef.current = window.setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "client:update", path: pathname }));
    }
  }, [pathname]);

  const value = useMemo(() => ({ jobs, clients, status }), [clients, jobs, status]);

  return <AppStreamContext.Provider value={value}>{children}</AppStreamContext.Provider>;
}

export function useAppStream() {
  const context = useContext(AppStreamContext);
  if (!context) {
    throw new Error("useAppStream must be used within AppStreamProvider");
  }
  return context;
}
