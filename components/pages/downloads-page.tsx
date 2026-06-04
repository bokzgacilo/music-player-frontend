"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/page-header";
import { DownloadJobs } from "@/components/music/download-jobs";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { useAppStream } from "@/components/app/app-stream-provider";

export function DownloadsPage() {
  const { jobs } = useAppStream();
  const [retryingIds, setRetryingIds] = useState<Set<number>>(new Set());

  async function retryDownload(id: number) {
    setRetryingIds((current) => new Set(current).add(id));
    try {
      await api.retryDownload(id);
    } finally {
      setRetryingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  const counts = useMemo(() => ({
    queued: jobs.filter((job) => job.status === "queued").length,
    active: jobs.filter((job) => ["downloading", "processing"].includes(job.status)).length,
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length
  }), [jobs]);

  return (
    <div className="mx-auto">
      <PageHeader eyebrow="Downloads" title="Download queue" description="Track queued, active, completed, and failed downloads from yt-dlp." />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Queued" value={counts.queued} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Completed" value={counts.completed} />
        <StatCard label="Failed" value={counts.failed} />
      </div>
      {jobs.length ? (
        <DownloadJobs jobs={jobs} limit={100} onRetry={retryDownload} retryingIds={retryingIds} />
      ) : (
        <EmptyState>No download jobs yet.</EmptyState>
      )}
    </div>
  );
}
