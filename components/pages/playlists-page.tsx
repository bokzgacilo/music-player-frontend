"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const payload = await api.playlists();
    setPlaylists(payload.playlists);
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

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Playlists" title="Local playlists" description="Create playlists in SQLite and add downloaded songs from the library." />
      <form className="mb-6 flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); create(); }}>
        <Input placeholder="Playlist name" value={name} onChange={(event) => setName(event.target.value)} />
        <Button><Plus size={17} />Create</Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {playlists.length === 0 ? <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">No playlists yet.</p> : null}
        {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <Card className="p-4 transition hover:border-primary">
              <h2 className="truncate font-semibold">{playlist.name}</h2>
              <p className="mt-2 text-xs text-muted-foreground">Updated {new Date(playlist.updated_at).toLocaleString()}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
