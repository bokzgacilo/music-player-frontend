"use client";

import { Grid3X3, List, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_SESSION_KEY, api } from "@/lib/api";
import type { Playlist, Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { SongList } from "@/components/music/song-list";

const libraryPageSize = 32;

export function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextOffset, setNextOffset] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadFirstPage = useCallback(async () => {
    setRefreshing(true);
    try {
      const [libraryPayload, playlistPayload] = await Promise.all([
        api.library({ limit: libraryPageSize, offset: 0, q: query.trim() || undefined }),
        api.playlists()
      ]);
      setSongs(libraryPayload.songs);
      setHasMore(libraryPayload.hasMore);
      setNextOffset(libraryPayload.nextOffset);
      setPlaylists(playlistPayload.playlists);
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || refreshing) return;
    setLoadingMore(true);
    try {
      const libraryPayload = await api.library({ limit: libraryPageSize, offset: nextOffset, q: query.trim() || undefined });
      setSongs((current) => [...current, ...libraryPayload.songs]);
      setHasMore(libraryPayload.hasMore);
      setNextOffset(libraryPayload.nextOffset);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextOffset, query, refreshing]);

  async function refresh() {
    await loadFirstPage();
  }

  async function deleteSong(song: Song) {
    await api.adminDeleteSong(song.id);
    await loadFirstPage();
  }

  useEffect(() => {
    setIsAdmin(Boolean(window.localStorage.getItem(ADMIN_SESSION_KEY)));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadFirstPage().catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadFirstPage]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNextPage().catch(() => undefined);
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNextPage]);

  return (
    <div className="mx-auto">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader eyebrow="Library" title="Downloaded music" description="Only active songs are shown here. Admin deletes remove the song from the database and storage." />
        <Button variant="outline" onClick={() => refresh().catch(() => undefined)} disabled={refreshing}>
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
      <SongList
        songs={songs}
        playlists={playlists}
        onChanged={refresh}
        onDeleteSong={isAdmin ? deleteSong : undefined}
        variant={view}
      />
      <div ref={loadMoreRef} className="h-12" />
      {loadingMore ? <p className="py-3 text-center text-sm text-muted-foreground">Loading more songs...</p> : null}
      {!hasMore && songs.length ? <p className="py-3 text-center text-sm text-muted-foreground">End of library</p> : null}
    </div>
  );
}
