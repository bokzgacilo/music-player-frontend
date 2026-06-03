"use client";

import { Download, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DownloadJob, SearchResult } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>();

  async function refreshJobs() {
    const payload = await api.downloads().catch(() => ({ jobs: [] }));
    setJobs(payload.jobs);
  }

  useEffect(() => {
    refreshJobs();
    const timer = window.setInterval(refreshJobs, 1500);
    return () => window.clearInterval(timer);
  }, []);

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
      await refreshJobs();
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
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Search" title="Search YouTube audio" description="The backend searches with yt-dlp using ytsearch20 and queues MP3 downloads locally." />
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
        <Input placeholder="Search for a song, artist, or album" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button disabled={loading || !query.trim()}><Search size={17} />{loading ? "Searching" : "Search"}</Button>
      </form>
      {error ? <p className="mt-4 rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p> : null}
      <div className="mt-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.length === 0 ? <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Run a search to see results.</p> : null}
          {results.map((result) => {
            const isDownloading = downloadingIds.has(result.youtube_id);
            const activeJob = jobs.find((job) => job.youtube_id === result.youtube_id && ["queued", "downloading", "processing"].includes(job.status));
            return (
            <Card key={result.youtube_id} className="grid overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.thumbnail ?? ""} alt="" className="aspect-video w-full bg-muted object-cover" />
              <div className="grid gap-3 p-3">
                <div className="min-w-0">
                <p className="truncate text-sm font-medium">{result.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {result.artist} • {formatDuration(result.duration)}
                  {activeJob ? ` • ${activeJob.status} ${Math.round(activeJob.progress)}%` : ""}
                </p>
              </div>
                <Button className="w-full" onClick={() => download(result)} disabled={isDownloading || Boolean(activeJob)}>
                  {isDownloading || activeJob ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
                  {activeJob ? "Queued" : isDownloading ? "Starting" : "Download"}
                </Button>
              </div>
            </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
