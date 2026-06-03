import type { DownloadJob, Playlist, SearchResult, Song, ToolStatus } from "@/lib/types";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  base: apiBase,
  search(q: string) {
    return request<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(q)}`);
  },
  download(result: SearchResult) {
    return request<{ duplicate: boolean; jobId?: number }>("/api/download", {
      method: "POST",
      body: JSON.stringify(result)
    });
  },
  downloads() {
    return request<{ jobs: DownloadJob[] }>("/api/downloads");
  },
  tools() {
    return request<{ tools: ToolStatus[] }>("/api/tools");
  },
  library() {
    return request<{ songs: Song[] }>("/api/library");
  },
  recycleBin() {
    return request<{ songs: Song[] }>("/api/recycle-bin");
  },
  deleteSong(id: number) {
    return request<{ ok: true }>(`/api/library/${id}`, { method: "DELETE" });
  },
  restoreSong(id: number) {
    return request<{ song: Song }>(`/api/recycle-bin/${id}/restore`, { method: "POST" });
  },
  markPlayed(id: number) {
    return request<{ song: Song }>(`/api/library/${id}/play`, { method: "POST" });
  },
  favorite(id: number) {
    return request<{ song: Song }>(`/api/library/${id}/favorite`, { method: "POST" });
  },
  playlists() {
    return request<{ playlists: Playlist[] }>("/api/playlists");
  },
  playlist(id: number) {
    return request<{ playlist: Playlist; songs: Song[] }>(`/api/playlists/${id}`);
  },
  createPlaylist(name: string) {
    return request<{ playlist: Playlist }>("/api/playlists", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  },
  renamePlaylist(id: number, name: string) {
    return request<{ playlist: Playlist }>(`/api/playlists/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name })
    });
  },
  deletePlaylist(id: number) {
    return request<void>(`/api/playlists/${id}`, { method: "DELETE" });
  },
  addPlaylistSong(id: number, songId: number) {
    return request<{ ok: true }>(`/api/playlists/${id}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId })
    });
  },
  removePlaylistSong(id: number, songId: number) {
    return request<void>(`/api/playlists/${id}/songs/${songId}`, { method: "DELETE" });
  },
  streamUrl(songId: number) {
    return `${apiBase}/api/stream/${songId}`;
  },
  thumbnailUrl(songId: number) {
    return `${apiBase}/api/thumbnails/${songId}`;
  }
};
