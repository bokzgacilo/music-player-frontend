"use client";

import type * as React from "react";
import type { DownloadJob } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Gauge, HardDrive, Loader2, RotateCcw } from "lucide-react";

const activeStatuses = new Set(["queued", "downloading", "processing"]);

export function DownloadJobs({
  jobs,
  limit = 6,
  onRetry,
  retryingIds = new Set()
}: {
  jobs: DownloadJob[];
  limit?: number;
  onRetry?: (id: number) => void;
  retryingIds?: Set<number>;
}) {
  if (!jobs.length) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-semibold">Download queue</h2>
      {jobs.slice(0, limit).map((job) => {
        const active = activeStatuses.has(job.status);
        const failed = job.status === "failed";
        const retrying = retryingIds.has(job.id);
        return (
        <Card key={job.id}>
          <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">{job.title}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={failed ? "destructive" : active ? "secondary" : "muted"} className="gap-1">
                {active ? <Loader2 className="animate-spin" size={13} /> : null}
                {job.status}
              </Badge>
              {failed && onRetry ? (
                <Button size="sm" variant="outline" disabled={retrying} onClick={() => onRetry(job.id)}>
                  {retrying ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                  Retry
                </Button>
              ) : null}
            </div>
          </div>
          <Progress className="mt-2" value={job.progress} />
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round(job.progress)}%
            {job.requested_by_username ? ` • requested by ${job.requested_by_username}` : ""}
          </p>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <JobMeta icon={<Clock size={14} />} label="Download time" value={formatElapsed(job.downloadDurationSeconds)} />
            <JobMeta icon={<HardDrive size={14} />} label="File size" value={formatBytes(job.fileSizeBytes)} />
            <JobMeta icon={<Gauge size={14} />} label="Bitrate" value={job.bitrateKbps ? `${job.bitrateKbps} kbps` : "Unavailable"} />
          </div>
          {job.error_message ? <p className="mt-2 text-xs text-red-300">{job.error_message}</p> : null}
          </CardContent>
        </Card>
        );
      })}
    </section>
  );
}

function JobMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2">
      <span className="shrink-0">{icon}</span>
      <span className="shrink-0 font-medium text-foreground">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function formatElapsed(seconds?: number | null) {
  if (seconds == null) return "Unavailable";
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");
  if (minutes < 60) return `${minutes}:${remainingSeconds}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = String(minutes % 60).padStart(2, "0");
  return `${hours}:${remainingMinutes}:${remainingSeconds}`;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "Unavailable";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}
