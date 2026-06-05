"use client";

import type * as React from "react";
import { Activity, Clock, Globe, Monitor, Music2, PauseCircle, PlayCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStream } from "@/components/app/app-stream-provider";
import { api } from "@/lib/api";
import type { ClientUser, ConnectedClient } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function UsersPage() {
  const { clients, status } = useAppStream();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const activeListeners = clients.filter((client) => client.nowPlaying?.playing).length;

  useEffect(() => {
    api.adminClients().then((payload) => setUsers(payload.users)).catch(() => undefined);
  }, [clients.length]);

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Control Panel" title="Client monitor" description="Live client sessions, playback state, and Manila server timestamps." />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Open clients" value={clients.length} />
        <StatCard label="Playing now" value={activeListeners} />
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
        <h2 className="text-sm font-semibold">Live monitor</h2>
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
                <ClientMeta icon={<Clock size={15} />} label="Connected" value={client.connectedAt} />
                <ClientMeta icon={<Monitor size={15} />} label="Origin" value={client.origin || "Direct"} />
              </div>
              <NowPlayingPanel client={client} />
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
                <ClientMeta icon={<Clock size={15} />} label="Created" value={user.createdAt} />
                <ClientMeta icon={<Activity size={15} />} label="Last seen" value={user.lastSeenAt} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NowPlayingPanel({ client }: { client: ConnectedClient }) {
  const nowPlaying = client.nowPlaying;
  if (!nowPlaying) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        <Music2 size={16} />
        No song reported
      </div>
    );
  }

  const progress = nowPlaying.duration ? (nowPlaying.position / nowPlaying.duration) * 100 : 0;
  const StatusIcon = nowPlaying.playing ? PlayCircle : PauseCircle;

  return (
    <div className="grid gap-3 rounded-md border bg-background p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusIcon className={nowPlaying.playing ? "text-primary" : "text-muted-foreground"} size={18} />
            <p className="truncate text-sm font-medium">{nowPlaying.title}</p>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{nowPlaying.artist}</p>
        </div>
        <Badge variant={nowPlaying.playing ? "default" : "muted"}>{nowPlaying.playing ? "Playing" : "Paused"}</Badge>
      </div>
      <Progress value={progress} />
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <span>{formatDuration(nowPlaying.position)} / {formatDuration(nowPlaying.duration)}</span>
        <span>Song ID {nowPlaying.songId}</span>
        <span className="truncate">Reported {nowPlaying.reportedAt}</span>
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
