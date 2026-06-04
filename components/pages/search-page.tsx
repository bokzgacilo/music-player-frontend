"use client";

import { Check, Download, Loader2, Search } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { api } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { useAppStream } from "@/components/app/app-stream-provider";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const { jobs } = useAppStream();
  const [loading, setLoading] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>();

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(undefined);
    try {
      const payload = await api.search(query.trim());
      setResults(payload.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function download(result: SearchResult) {
    setDownloadingIds((current) => new Set(current).add(result.youtube_id));
    setError(undefined);
    try {
      await api.download(result);
      setAddedIds((current) => new Set(current).add(result.youtube_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingIds((current) => {
        const next = new Set(current);
        next.delete(result.youtube_id);
        return next;
      });
    }
  }

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Search" title="Search YouTube audio" description="The backend searches with yt-dlp using ytsearch20 and queues MP3 downloads locally." />
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
        <Input placeholder="Search for a song, artist, or album" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button disabled={loading || !query.trim()}><Search size={17} />{loading ? "Searching" : "Search"}</Button>
      </form>
      {error ? (
        <Alert className="mt-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.length === 0 ? <EmptyState>Run a search to see results.</EmptyState> : null}
          {results.map((result, index) => {
            const isDownloading = downloadingIds.has(result.youtube_id);
            const job = jobs.find((item) => item.youtube_id === result.youtube_id);
            const isAdded = addedIds.has(result.youtube_id) || Boolean(job);
            return (
            <Card
              key={result.youtube_id}
              className="search-result-card grid overflow-hidden p-0"
              style={{ "--search-result-delay": `${Math.min(index, 12) * 55}ms` } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.thumbnail ?? ""} alt="" className="aspect-video w-full bg-muted object-cover" />
              <CardContent className="grid gap-3 p-3">
                <div className="min-w-0">
                <p className="truncate text-sm font-medium">{result.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {result.artist} • {formatDuration(result.duration)}
                  {job ? ` • ${job.status} ${Math.round(job.progress)}%` : ""}
                </p>
              </div>
                <Button className="w-full" onClick={() => download(result)} disabled={isDownloading || isAdded}>
                  {isDownloading ? <Loader2 className="animate-spin" size={17} /> : isAdded ? <Check size={17} /> : <Download size={17} />}
                  {isDownloading ? "Starting" : isAdded ? "Added" : "Download"}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
