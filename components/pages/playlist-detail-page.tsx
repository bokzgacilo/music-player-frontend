"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { usePlayer } from "@/components/player/player-provider";
import { useClientSession } from "@/components/auth/client-session-provider";

export function PlaylistDetailPage({ id }: { id: string }) {
  const playlistId = Number(id);
  const player = usePlayer();
  const { user } = useClientSession();
  const [playlist, setPlaylist] = useState<Playlist>();
  const [songs, setSongs] = useState<Song[]>([]);

  const load = useCallback(async () => {
    const payload = await api.playlist(playlistId);
    setPlaylist(payload.playlist);
    setSongs(payload.songs);
  }, [playlistId]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  if (!playlist) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/playlists">Back to playlists</Link>
        <div className="mt-4">
          <EmptyState>Playlist not found.</EmptyState>
        </div>
      </div>
    );
  }

  const isOwner = playlist.created_by_client_id === user.id;

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/playlists"><ArrowLeft size={16} /> Back</Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <PageHeader eyebrow={playlist.is_shared ? "Public Playlist" : "Playlist"} title={playlist.name} description={`${songs.length} downloaded songs${playlist.created_by_username ? ` by ${playlist.created_by_username}` : ""}`} />
        {isOwner ? <Button variant="destructive" onClick={() => api.deletePlaylist(playlist.id)}><Trash2 size={17} />Delete</Button> : null}
      </div>
      <div className="grid gap-2">
        {songs.length === 0 ? <EmptyState>No songs in this playlist.</EmptyState> : null}
        {songs.map((song) => (
          <Card key={song.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 p-3">
            <button className="min-w-0 text-left" onClick={() => player.play(song, songs)}>
              <span className="block truncate text-sm font-medium">{song.title}</span>
              <span className="text-xs text-muted-foreground">{song.artist}</span>
            </button>
            <Button variant="ghost" onClick={() => player.play(song, songs)}>Play</Button>
            {isOwner ? <Button variant="ghost" onClick={() => api.removePlaylistSong(playlist.id, song.id).then(load)}>Remove</Button> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
