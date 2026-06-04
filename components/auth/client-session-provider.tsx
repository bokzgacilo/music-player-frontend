"use client";

import type * as React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, CLIENT_SESSION_KEY, CLIENT_USER_KEY } from "@/lib/api";
import type { ClientUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const avatars = [
  { label: "Lion", path: "/avatars/lion.png" },
  { label: "Bunny", path: "/avatars/bunny.png" },
  { label: "Panda", path: "/avatars/panda.png" }
];

type ClientSessionContextValue = {
  user: ClientUser;
};

const ClientSessionContext = createContext<ClientSessionContextValue | undefined>(undefined);

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [username, setUsername] = useState("");
  const [avatarPath, setAvatarPath] = useState(avatars[0].path);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(CLIENT_USER_KEY);
    const savedToken = window.localStorage.getItem(CLIENT_SESSION_KEY);
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser) as ClientUser);
      setLoading(false);
      api.me().then((payload) => {
        setUser(payload.user);
        window.localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(payload.user));
      }).catch(() => {
        window.localStorage.removeItem(CLIENT_SESSION_KEY);
        window.localStorage.removeItem(CLIENT_USER_KEY);
        setUser(null);
      });
      return;
    }
    setLoading(false);
  }, []);

  async function createSession(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = await api.createClientSession(username.trim(), avatarPath, window.navigator.userAgent);
      window.localStorage.setItem(CLIENT_SESSION_KEY, payload.token);
      window.localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(payload.user));
      setUser(payload.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create client session");
    } finally {
      setSubmitting(false);
    }
  }

  const value = useMemo(() => user ? { user } : undefined, [user]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading session...</div>;
  }

  if (!user || !value) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Choose your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={createSession}>
              <Input autoFocus placeholder="Your username" value={username} onChange={(event) => setUsername(event.target.value)} />
              <div className="grid gap-2">
                <p className="text-sm font-medium">Pick an avatar</p>
                <div className="grid grid-cols-3 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.path}
                      type="button"
                      className={cn(
                        "grid gap-2 rounded-md border bg-card p-3 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground",
                        avatarPath === avatar.path && "border-primary text-foreground ring-2 ring-ring"
                      )}
                      onClick={() => setAvatarPath(avatar.path)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatar.path} alt="" className="mx-auto h-16 w-16 rounded-full object-cover" />
                      {avatar.label}
                    </button>
                  ))}
                </div>
              </div>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button disabled={submitting || !username.trim()}>{submitting ? "Saving" : "Continue"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <ClientSessionContext.Provider value={value}>{children}</ClientSessionContext.Provider>;
}

export function useClientSession() {
  const context = useContext(ClientSessionContext);
  if (!context) throw new Error("useClientSession must be used within ClientSessionProvider");
  return context;
}
