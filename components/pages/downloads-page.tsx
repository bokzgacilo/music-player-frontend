"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { DownloadJob } from "@/lib/types";
import { PageHeader } from "@/components/common/page-header";
import { DownloadJobs } from "@/components/music/download-jobs";
import { Card } from "@/components/ui/card";

export function DownloadsPage() {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);

  async function load() {
    const payload = await api.downloads().catch(() => ({ jobs: [] }));
    setJobs(payload.jobs);
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const counts = useMemo(() => ({
    queued: jobs.filter((job) => job.status === "queued").length,
    active: jobs.filter((job) => ["downloading", "processing"].includes(job.status)).length,
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length
  }), [jobs]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Downloads" title="Download queue" description="Track queued, active, completed, and failed downloads from yt-dlp." />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Queued</p><p className="mt-1 text-2xl font-semibold">{counts.queued}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Active</p><p className="mt-1 text-2xl font-semibold">{counts.active}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="mt-1 text-2xl font-semibold">{counts.completed}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Failed</p><p className="mt-1 text-2xl font-semibold">{counts.failed}</p></Card>
      </div>
      {jobs.length ? <DownloadJobs jobs={jobs} limit={100} /> : <p className="rounded-md border bg-card p-4 text-sm text-muted-foreground">No download jobs yet.</p>}
    </div>
  );
}
