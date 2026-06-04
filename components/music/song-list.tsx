"use client";

import { Heart, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { usePlayer } from "@/components/player/player-provider";
import { useClientSession } from "@/components/auth/client-session-provider";

export function SongList({ songs, playlists = [], onChanged, variant = "list" }: { songs: Song[]; playlists?: Playlist[]; onChanged?: () => void; variant?: "list" | "grid" }) {
  const player = usePlayer();
  const { user } = useClientSession();
  if (songs.length === 0) {
    return <EmptyState>No songs yet.</EmptyState>;
  }

  if (variant === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {songs.map((song) => {
          const canRemove = song.downloaded_by_client_id === user.id;
          return (
            <Card key={song.id} className="overflow-hidden p-0">
              <button className="group relative aspect-square w-full bg-muted text-left" onClick={() => player.play(song, songs)} aria-label={`Play ${song.title}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={api.thumbnailUrl(song.id)} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Play size={20} fill="currentColor" />
                  </span>
                </span>
              </button>
              <CardContent className="grid gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{song.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Played {song.play_count} • {new Date(song.downloaded_at).toLocaleDateString()}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Added by {song.downloaded_by_username ?? "Unknown"}
                  </p>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-1">
                  <Button size="sm" onClick={() => player.play(song, songs)}><Play size={16} /> Play now</Button>
                  <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite">
                    <Heart size={17} fill={song.favorite ? "currentColor" : "none"} />
                  </Button>
                  {canRemove ? (
                    <Button variant="ghost" size="icon" onClick={() => api.deleteSong(song.id).then(onChanged)} aria-label="Remove song"><Trash2 size={17} /></Button>
                  ) : null}
                </div>
                {playlists.length ? (
                  <AddToPlaylistSelect songId={song.id} playlists={playlists} onChanged={onChanged} label="Add to playlist" />
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2")}>
      {songs.map((song) => {
        const canRemove = song.downloaded_by_client_id === user.id;
        return (
          <Card key={song.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
            <button className="relative h-16 w-16 overflow-hidden rounded-md bg-muted" onClick={() => player.play(song, songs)} aria-label={`Play ${song.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={api.thumbnailUrl(song.id)} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <span className="absolute inset-0 grid place-items-center bg-black/30 text-white opacity-0 transition hover:opacity-100">
                <Play size={17} fill="currentColor" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{song.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {song.artist} • {formatDuration(song.duration)} • Played {song.play_count} • Added {new Date(song.downloaded_at).toLocaleDateString()}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">Added by {song.downloaded_by_username ?? "Unknown"}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => player.play(song, songs)}><Play size={16} /> Play now</Button>
              <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite">
                <Heart size={17} fill={song.favorite ? "currentColor" : "none"} />
              </Button>
              {playlists.length ? (
                <AddToPlaylistSelect songId={song.id} playlists={playlists} onChanged={onChanged} label="Add" className="w-28" />
              ) : <Plus className="text-muted-foreground" size={17} />}
              {canRemove ? (
                <Button variant="ghost" size="icon" onClick={() => api.deleteSong(song.id).then(onChanged)} aria-label="Remove song"><Trash2 size={17} /></Button>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AddToPlaylistSelect({
  songId,
  playlists,
  onChanged,
  label,
  className
}: {
  songId: number;
  playlists: Playlist[];
  onChanged?: () => void;
  label: string;
  className?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        api.addPlaylistSong(Number(nextValue), songId).then(() => {
          setValue("");
          onChanged?.();
        });
      }}
    >
      <SelectTrigger className={cn("h-9 text-xs", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {playlists.map((playlist) => (
          <SelectItem key={playlist.id} value={String(playlist.id)}>
            {playlist.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
