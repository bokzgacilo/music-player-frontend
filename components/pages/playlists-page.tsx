"use client";

import Link from "next/link";
import { Globe2, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";

type PlaylistTab = "mine" | "public";

export function PlaylistsPage() {
  const [mine, setMine] = useState<Playlist[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<PlaylistTab>("mine");
  const [name, setName] = useState("");

  async function load() {
    const payload = await api.playlists();
    setMine(payload.mine ?? payload.playlists);
    setPublicPlaylists(payload.public ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function create() {
    if (!name.trim()) return;
    await api.createPlaylist(name.trim());
    setName("");
    await load();
  }

  async function setSharing(playlist: Playlist, isShared: boolean) {
    const payload = await api.setPlaylistSharing(playlist.id, isShared);
    setMine((current) => current.map((item) => (item.id === playlist.id ? payload.playlist : item)));
    await load();
  }

  const activePlaylists = tab === "mine" ? mine : publicPlaylists;

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Playlists" title="Local playlists" description="Create playlists in SQLite and add downloaded songs from the library." />
      <div className="mb-6 flex flex-col gap-4">
        <div className="inline-flex w-fit rounded-md border bg-card p-1">
          <Button type="button" variant={tab === "mine" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("mine")}>
            <User size={16} />
            My playlist
          </Button>
          <Button type="button" variant={tab === "public" ? "secondary" : "ghost"} size="sm" onClick={() => setTab("public")}>
            <Globe2 size={16} />
            Public playlist
          </Button>
        </div>
        {tab === "mine" ? (
          <form className="flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); create(); }}>
            <Input placeholder="Playlist name" value={name} onChange={(event) => setName(event.target.value)} />
            <Button><Plus size={17} />Create</Button>
          </form>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {activePlaylists.length === 0 ? <EmptyState>{tab === "mine" ? "No playlists yet." : "No public playlists yet."}</EmptyState> : null}
        {activePlaylists.map((playlist) => (
          <Card key={playlist.id} className="transition hover:border-primary">
            <CardContent className="grid gap-4 p-4">
              <Link href={`/playlists/${playlist.id}`} className="min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate">{playlist.name}</CardTitle>
                  {playlist.is_shared ? <Badge variant="secondary">Sharing</Badge> : null}
                </div>
                <CardDescription className="mt-2 text-xs">
                  Updated {new Date(playlist.updated_at).toLocaleString()}
                  {playlist.created_by_username ? ` • by ${playlist.created_by_username}` : ""}
                </CardDescription>
              </Link>
              {tab === "mine" ? (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">{playlist.is_shared ? "Sharing" : "Private"}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(playlist.is_shared)}
                    className={cn(
                      "relative h-6 w-11 rounded-full border transition",
                      playlist.is_shared ? "border-primary bg-primary" : "border-border bg-muted"
                    )}
                    onClick={() => setSharing(playlist, !playlist.is_shared)}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition",
                        playlist.is_shared ? "left-5" : "left-0.5"
                      )}
                    />
                  </button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
