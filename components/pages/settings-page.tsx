"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ToolStatus } from "@/lib/types";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  const [tools, setTools] = useState<ToolStatus[]>([]);

  useEffect(() => {
    api.tools().then((payload) => setTools(payload.tools)).catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Settings" title="Local runtime settings" description="Configure binaries and ports with environment variables. This app runs locally and stores data in SQLite plus local folders." />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tool status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            {tools.length === 0 ? <p>Checking API tools...</p> : null}
            {tools.map((tool) => {
              const message = tool.available ? `available at ${tool.resolvedPath}` : `missing; configured as ${tool.configuredPath}`;
              return (
                <div key={tool.name} className="grid gap-2 rounded-md border bg-background p-3 sm:grid-cols-[auto_1fr] sm:items-center">
                  <Badge variant={tool.available ? "secondary" : "destructive"}>{tool.name}</Badge>
                  <p className={tool.available ? "text-emerald-300" : "text-red-300"}>{message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p><code className="text-foreground">NEXT_PUBLIC_API_URL</code> points the web app at the Express API.</p>
            <p><code className="text-foreground">YTDLP_PATH</code> defaults to <code className="text-foreground">yt-dlp</code>.</p>
            <p><code className="text-foreground">FFMPEG_PATH</code> defaults to <code className="text-foreground">ffmpeg</code>.</p>
            <p><code className="text-foreground">DATABASE_PATH</code> defaults to <code className="text-foreground">database/music.db</code>.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Audio files are saved in <code className="text-foreground">storage/music/</code>.</p>
            <p>Thumbnails are saved in <code className="text-foreground">storage/thumbnails/</code>.</p>
            <p>The frontend streams through <code className="text-foreground">GET /api/stream/:songId</code>, never arbitrary file paths.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
