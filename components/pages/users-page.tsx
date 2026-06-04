"use client";

import type * as React from "react";
import { Activity, Clock, Globe, Monitor, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStream } from "@/components/app/app-stream-provider";
import { api } from "@/lib/api";
import type { ClientUser } from "@/lib/types";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function UsersPage() {
  const { clients, status } = useAppStream();
  const [users, setUsers] = useState<ClientUser[]>([]);

  useEffect(() => {
    api.adminClients().then((payload) => setUsers(payload.users)).catch(() => undefined);
  }, [clients.length]);

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Control Panel" title="Open clients" description="Monitor active browser clients connected to the local backend stream." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Open clients" value={clients.length} />
        <Card>
          <CardContent className="flex h-full items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Stream status</p>
              <p className="mt-1 text-2xl font-semibold capitalize">{status}</p>
            </div>
            <Activity className="text-muted-foreground" size={24} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Tracking</p>
              <p className="mt-1 text-2xl font-semibold">Live</p>
            </div>
            <Users className="text-muted-foreground" size={24} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3">
        <h2 className="text-sm font-semibold">Live clients</h2>
        {clients.length === 0 ? <EmptyState>No clients connected.</EmptyState> : null}
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="grid gap-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {client.avatarPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={client.avatarPath} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Connected</Badge>
                        {client.isAdmin ? <Badge>Admin</Badge> : null}
                        <Badge variant="outline">{client.username}</Badge>
                        <span className="truncate text-sm font-medium">{client.id}</span>
                      </div>
                      <p className="mt-2 break-words text-sm text-muted-foreground">{client.userAgent}</p>
                    </div>
                  </div>
                </div>
                <Badge variant={client.path ? "default" : "muted"}>{client.path || "Unknown path"}</Badge>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <ClientMeta icon={<Globe size={15} />} label="IP" value={client.ipAddress} />
                <ClientMeta icon={<Clock size={15} />} label="Connected" value={new Date(client.connectedAt).toLocaleString()} />
                <ClientMeta icon={<Monitor size={15} />} label="Origin" value={client.origin || "Direct"} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-3">
        <h2 className="text-sm font-semibold">Registered client accounts</h2>
        {users.length === 0 ? <EmptyState>No saved clients yet.</EmptyState> : null}
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="grid gap-3 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatarPath} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0">
                  <p className="font-medium">{user.username}</p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{user.userAgent}</p>
                  </div>
                </div>
                <Badge variant="muted">{user.sessionCount ?? 0} sessions</Badge>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <ClientMeta icon={<Clock size={15} />} label="Created" value={new Date(user.createdAt).toLocaleString()} />
                <ClientMeta icon={<Activity size={15} />} label="Last seen" value={new Date(user.lastSeenAt).toLocaleString()} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClientMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="shrink-0 text-xs font-medium text-foreground">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
