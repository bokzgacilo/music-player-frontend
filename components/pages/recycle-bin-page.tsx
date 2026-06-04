"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Song } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export function RecycleBinPage() {
  const [songs, setSongs] = useState<Song[]>([]);

  async function load() {
    const payload = await api.recycleBin();
    setSongs(payload.songs);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function restore(id: number) {
    await api.restoreSong(id);
    await load();
  }

  return (
    <div className="mx-auto">
      <PageHeader
        eyebrow="Recycle Bin"
        title="Deleted songs"
        description="Deleted songs stay in SQLite with their MP3 and thumbnail paths. Restore them to show them in Library again."
      />
      <div className="grid gap-2">
        {songs.length === 0 ? (
          <EmptyState>Recycle bin is empty.</EmptyState>
        ) : null}
        {songs.map((song) => (
          <Card key={song.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={api.thumbnailUrl(song.id)}
              alt=""
              className="h-12 w-12 rounded-md bg-muted object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{song.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {song.artist} • {formatDuration(song.duration)} • deleted {song.deleted_at ? new Date(song.deleted_at).toLocaleString() : "recently"}
              </p>
              {song.downloaded_by_username ? (
                <p className="mt-1 truncate text-[11px] text-muted-foreground">Downloaded by {song.downloaded_by_username}</p>
              ) : null}
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                MP3: {song.file_path} {song.thumbnail_path ? `• Thumbnail: ${song.thumbnail_path}` : ""}
              </p>
            </div>
            <Button onClick={() => restore(song.id)}>
              <RotateCcw size={17} />
              Restore
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
