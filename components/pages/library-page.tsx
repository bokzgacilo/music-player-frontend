"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { SongList } from "@/components/music/song-list";

export function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader eyebrow="Library" title="Downloaded music" description="Only active songs are shown here. Deleted songs are flagged in SQLite and can be restored from Recycle Bin." />
        <Button variant="outline" onClick={() => load().catch(() => undefined)} disabled={refreshing}>
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={17} />
          Refresh
        </Button>
      </div>
      <SongList songs={songs} playlists={playlists} onChanged={load} variant="grid" />
    </div>
  );
}
