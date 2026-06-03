"use client";

import { Heart, Play, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/components/player/player-provider";

export function SongList({ songs, playlists = [], onChanged, variant = "list" }: { songs: Song[]; playlists?: Playlist[]; onChanged?: () => void; variant?: "list" | "grid" }) {
  const player = usePlayer();
  if (songs.length === 0) {
    return <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">No songs yet.</p>;
  }

  if (variant === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {songs.map((song) => (
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
            <div className="grid gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-muted-foreground">{song.artist} • {formatDuration(song.duration)}</p>
                <p className="truncate text-[11px] text-muted-foreground">played {song.play_count}</p>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-1">
                <Button size="sm" onClick={() => player.play(song, songs)}><Play size={16} /> Play</Button>
                <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite">
                  <Heart size={17} fill={song.favorite ? "currentColor" : "none"} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => api.deleteSong(song.id).then(onChanged)} aria-label="Delete song"><Trash2 size={17} /></Button>
              </div>
              {playlists.length ? (
                <select
                  className="h-9 rounded-md border bg-background px-2 text-xs"
                  defaultValue=""
                  onChange={(event) => {
                    const playlistId = Number(event.target.value);
                    if (playlistId) api.addPlaylistSong(playlistId, song.id).then(onChanged);
                    event.target.value = "";
                  }}
                >
                  <option value="">Add to playlist</option>
                  {playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.name}</option>)}
                </select>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2")}>
      {songs.map((song) => (
        <Card key={song.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
          <Button size="icon" onClick={() => player.play(song, songs)} aria-label={`Play ${song.title}`}><Play size={17} /></Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{song.title}</p>
            <p className="truncate text-xs text-muted-foreground">{song.artist} • {formatDuration(song.duration)} • played {song.play_count}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite">
              <Heart size={17} fill={song.favorite ? "currentColor" : "none"} />
            </Button>
            {playlists.length ? (
              <select
                className="h-9 rounded-md border bg-background px-2 text-xs"
                defaultValue=""
                onChange={(event) => {
                  const playlistId = Number(event.target.value);
                  if (playlistId) api.addPlaylistSong(playlistId, song.id).then(onChanged);
                  event.target.value = "";
                }}
              >
                <option value="">Add</option>
                {playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.name}</option>)}
              </select>
            ) : <Plus className="text-muted-foreground" size={17} />}
            <Button variant="ghost" size="icon" onClick={() => api.deleteSong(song.id).then(onChanged)} aria-label="Delete song"><Trash2 size={17} /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
