"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Heart, ListPlus, Play, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { usePlayer } from "@/components/player/player-provider";

export function SongList({ songs, playlists = [], onChanged, variant = "list" }: { songs: Song[]; playlists?: Playlist[]; onChanged?: () => void; variant?: "list" | "grid" }) {
  const player = usePlayer();
  if (songs.length === 0) {
    return <EmptyState>No songs yet.</EmptyState>;
  }

  if (variant === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {songs.map((song) => {
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
              <CardContent className="grid gap-4 p-4">
                <div className="min-w-0">
                  <ScrollingTitle title={song.title} className="text-lg font-semibold leading-tight" />
                  <p className="mt-2 truncate text-sm text-muted-foreground">
                    Played {song.play_count} | Like {song.favorite ? 1 : 0}
                  </p>
                  <UserDateLine song={song} />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                  <Button className="h-12 text-base" onClick={() => player.play(song, songs)}><Play size={20} /> Play now</Button>
                  <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite song">
                    <Heart size={22} fill={song.favorite ? "currentColor" : "none"} />
                  </Button>
                  {playlists.length ? (
                    <PlaylistMembershipModal song={song} playlists={playlists} onChanged={onChanged} label="Edit playlists" iconOnly />
                  ) : <Plus className="text-muted-foreground" size={20} />}
                </div>
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
              <ScrollingTitle title={song.title} className="text-sm font-medium" />
              <p className="truncate text-xs text-muted-foreground">
                {song.artist} • {formatDuration(song.duration)} • Played {song.play_count} • Added {new Date(song.downloaded_at).toLocaleDateString()}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">Added by {song.downloaded_by_username ?? "Unknown"}</p>
              <PlaylistIndicator names={song.playlist_names ?? []} compact />
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => player.play(song, songs)}><Play size={16} /> Play now</Button>
              <Button variant="ghost" size="icon" onClick={() => api.favorite(song.id).then(onChanged)} aria-label="Favorite">
                <Heart size={17} fill={song.favorite ? "currentColor" : "none"} />
              </Button>
              {playlists.length ? (
                <PlaylistMembershipModal song={song} playlists={playlists} onChanged={onChanged} label={song.playlist_ids?.length ? "Edit playlists" : "Add to playlist"} iconOnly />
              ) : <Plus className="text-muted-foreground" size={17} />}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ScrollingTitle({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn("song-title-marquee overflow-hidden", className)} title={title}>
      <span className="song-title-marquee-track">
        <span>{title}</span>
        <span aria-hidden="true">{title}</span>
      </span>
    </div>
  );
}

function UserDateLine({ song }: { song: Song }) {
  const avatarPath = song.downloaded_by_avatar_path ?? "/avatars/lion.png";
  return (
    <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatarPath} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
      <span className="min-w-0 truncate">by {song.downloaded_by_username ?? "Unknown"}</span>
      <span className="shrink-0">|</span>
      <span className="shrink-0">{new Date(song.downloaded_at).toLocaleDateString()}</span>
    </div>
  );
}

function PlaylistIndicator({ names, compact = false }: { names: string[]; compact?: boolean }) {
  if (names.length === 0) return null;
  const visible = names.slice(0, compact ? 2 : 3);
  const remaining = names.length - visible.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", compact ? "mt-1" : "")}>
      {visible.map((name) => (
        <Badge key={name} variant="muted" className="max-w-full truncate">
          {name}
        </Badge>
      ))}
      {remaining > 0 ? <Badge variant="outline">+{remaining}</Badge> : null}
    </div>
  );
}

function PlaylistMembershipModal({
  song,
  playlists,
  onChanged,
  label,
  iconOnly = false
}: {
  song: Song;
  playlists: Playlist[];
  onChanged?: () => void;
  label: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>(song.playlist_ids ?? []);
  const [saving, setSaving] = useState(false);

  async function saveMemberships() {
    setSaving(true);
    try {
      const originalIds = new Set(song.playlist_ids ?? []);
      const nextIds = new Set(selectedPlaylistIds);
      const toAdd = [...nextIds].filter((playlistId) => !originalIds.has(playlistId));
      const toRemove = [...originalIds].filter((playlistId) => !nextIds.has(playlistId));
      await Promise.all([
        ...toAdd.map((playlistId) => api.addPlaylistSong(playlistId, song.id)),
        ...toRemove.map((playlistId) => api.removePlaylistSong(playlistId, song.id))
      ]);
      setOpen(false);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  function closeModal(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setSelectedPlaylistIds(song.playlist_ids ?? []);
    }
  }

  function togglePlaylist(playlistId: number) {
    setSelectedPlaylistIds((current) => (
      current.includes(playlistId)
        ? current.filter((id) => id !== playlistId)
        : [...current, playlistId]
    ));
  }

  return (
    <Dialog.Root open={open} onOpenChange={closeModal}>
      <Dialog.Trigger asChild>
        <Button variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon" : "sm"} aria-label={label}>
          <ListPlus size={16} />
          {iconOnly ? null : label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md border bg-card p-5 text-card-foreground shadow-xl outline-none">
          <div className="grid gap-1">
            <Dialog.Title className="text-base font-semibold">Add to playlist</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Check every playlist where this song should appear.
            </Dialog.Description>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-md border">
            <div className="grid p-1" aria-label="Available playlists">
              {playlists.map((playlist) => {
                const selected = selectedPlaylistIds.includes(playlist.id);
                return (
                  <label
                    key={playlist.id}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition hover:bg-muted",
                      selected && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{playlist.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {playlist.is_shared ? "Sharing" : "Private"}
                        {playlist.created_by_username ? ` by ${playlist.created_by_username}` : ""}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      className="h-4 w-4 shrink-0 accent-primary"
                      onChange={() => togglePlaylist(playlist.id)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" disabled={saving}>Cancel</Button>
            </Dialog.Close>
            <Button type="button" disabled={saving} onClick={saveMemberships}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
