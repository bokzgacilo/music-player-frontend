"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { api, ADMIN_SESSION_KEY } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!token) {
      setChecking(false);
      return;
    }

    api.adminMe().then(() => setAuthorized(true)).catch(() => {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
    }).finally(() => setChecking(false));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = await api.adminLogin(username, password);
      window.localStorage.setItem(ADMIN_SESSION_KEY, payload.token);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid admin credentials");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return <div className="text-sm text-muted-foreground">Checking admin session...</div>;
  }

  if (!authorized) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Control panel login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={login}>
              <Input placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
              <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button disabled={submitting || !username || !password}>{submitting ? "Signing in" : "Sign in"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
