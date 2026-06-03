"use client";

import type { DownloadJob } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const activeStatuses = new Set(["queued", "downloading", "processing"]);

export function DownloadJobs({ jobs, limit = 6 }: { jobs: DownloadJob[]; limit?: number }) {
  if (!jobs.length) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-semibold">Download queue</h2>
      {jobs.slice(0, limit).map((job) => {
        const active = activeStatuses.has(job.status);
        return (
        <div key={job.id} className="rounded-md border bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">{job.title}</p>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              {active ? <Loader2 className="animate-spin" size={13} /> : null}
              {job.status}
            </span>
          </div>
          <Progress className="mt-2" value={job.progress} />
          <p className="mt-1 text-xs text-muted-foreground">{Math.round(job.progress)}%</p>
          {job.error_message ? <p className="mt-2 text-xs text-red-300">{job.error_message}</p> : null}
        </div>
        );
      })}
    </section>
  );
}
