"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DownloadJob } from "@/lib/types";
import { PageHeader } from "@/components/common/page-header";
import { DownloadJobs } from "@/components/music/download-jobs";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { useAppStream } from "@/components/app/app-stream-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DownloadsPage() {
  const { jobs: liveJobs } = useAppStream();
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [retryingIds, setRetryingIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ queued: 0, active: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false);

  const loadDownloads = useCallback(async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const payload = await api.downloads({ page: nextPage, pageSize: nextPageSize });
      setJobs(payload.jobs);
      setPage(payload.page);
      setPageSize(payload.pageSize);
      setTotal(payload.total);
      setTotalPages(payload.totalPages);
      setSummary(payload.summary);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  async function retryDownload(id: number) {
    setRetryingIds((current) => new Set(current).add(id));
    try {
      await api.retryDownload(id);
      await loadDownloads();
    } finally {
      setRetryingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  useEffect(() => {
    loadDownloads().catch(() => undefined);
  }, [loadDownloads, liveJobs.length]);

  function changePageSize(value: string) {
    setPageSize(Number(value));
    setPage(1);
  }

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Downloads" title="Download queue" description="Track queued, active, completed, and failed downloads. Up to 3 jobs can run at once." />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Queued" value={summary.queued} />
        <StatCard label="Active" value={summary.active} />
        <StatCard label="Completed" value={summary.completed} />
        <StatCard label="Failed" value={summary.failed} />
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages} · {total} records
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Max items/page</span>
          <Select value={String(pageSize)} onValueChange={changePageSize}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={String(value)}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {jobs.length ? (
        <DownloadJobs jobs={jobs} limit={pageSize} onRetry={retryDownload} retryingIds={retryingIds} />
      ) : (
        <EmptyState>{loading ? "Loading downloads..." : "No download jobs yet."}</EmptyState>
      )}
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
        <Button variant="outline" disabled={loading || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
      </div>
    </div>
  );
}
