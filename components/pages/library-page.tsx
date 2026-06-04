"use client";

import { Grid3X3, List, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { SongList } from "@/components/music/song-list";

export function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const [libraryPayload, playlistPayload] = await Promise.all([api.library(), api.playlists()]);
      setSongs(libraryPayload.songs);
      setPlaylists(playlistPayload.playlists);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return songs;
    return songs.filter((song) => {
      const haystack = [
        song.title,
        song.artist,
        song.downloaded_by_username,
        song.downloaded_at
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, songs]);

  return (
    <div className="mx-auto">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader eyebrow="Library" title="Downloaded music" description="Only active songs are shown here. Deleted songs are flagged in SQLite and can be restored from Recycle Bin." />
        <Button variant="outline" onClick={() => load().catch(() => undefined)} disabled={refreshing}>
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={17} />
          Refresh
        </Button>
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <Input className="pl-9" placeholder="Search downloaded music" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="inline-flex w-fit rounded-md border bg-card p-1">
          <Button type="button" variant={view === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setView("grid")}>
            <Grid3X3 size={16} />
            Grid
          </Button>
          <Button type="button" variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>
            <List size={16} />
            List
          </Button>
        </div>
      </div>
      <SongList songs={filteredSongs} playlists={playlists} onChanged={load} variant={view} />
    </div>
  );
}
