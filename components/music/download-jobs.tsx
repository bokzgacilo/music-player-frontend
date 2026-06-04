"use client";

import type { DownloadJob } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RotateCcw } from "lucide-react";

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
          {job.error_message ? <p className="mt-2 text-xs text-red-300">{job.error_message}</p> : null}
          </CardContent>
        </Card>
        );
      })}
    </section>
  );
}
