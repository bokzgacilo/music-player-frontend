import type { ClientUser, DownloadJob, Playlist, SearchResult, Song, ToolStatus } from "@/lib/types";

const apiBase = "";
const websocketApiBase = process.env.NEXT_PUBLIC_BACKEND_WS_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const CLIENT_SESSION_KEY = "musicplayer.clientSession";
export const CLIENT_USER_KEY = "musicplayer.clientUser";
export const ADMIN_SESSION_KEY = "musicplayer.adminSession";

function getStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function authHeaders() {
  const headers: Record<string, string> = {};
  const clientSession = getStoredValue(CLIENT_SESSION_KEY);
  const adminSession = getStoredValue(ADMIN_SESSION_KEY);
  if (clientSession) headers["x-client-session"] = clientSession;
  if (adminSession) headers["x-admin-session"] = adminSession;
  return headers;
}

function websocketUrl(path: string, params?: Record<string, string | null | undefined>) {
  const url = new URL(path, websocketApiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
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
  createClientSession(username: string, avatarPath: string, userAgent: string) {
    return request<{ token: string; user: ClientUser }>("/api/clients/session", {
      method: "POST",
      body: JSON.stringify({ username, avatarPath, userAgent })
    });
  },
  me() {
    return request<{ user: ClientUser }>("/api/clients/me");
  },
  adminLogin(username: string, password: string) {
    return request<{ token: string; username: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },
  adminMe() {
    return request<{ ok: true; username: string }>("/api/admin/me");
  },
  adminClients() {
    return request<{ users: ClientUser[] }>("/api/admin/clients");
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
  downloadsStreamUrl() {
    return websocketUrl("/api/downloads/stream");
  },
  appStreamUrl() {
    return websocketUrl("/api/stream", {
      clientSession: getStoredValue(CLIENT_SESSION_KEY),
      adminSession: getStoredValue(ADMIN_SESSION_KEY)
    });
  },
  retryDownload(id: number) {
    return request<{ job: DownloadJob }>(`/api/downloads/${id}/retry`, { method: "POST" });
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
    return request<{ playlists: Playlist[]; mine: Playlist[]; public: Playlist[] }>("/api/playlists");
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
  setPlaylistSharing(id: number, isShared: boolean) {
    return request<{ playlist: Playlist }>(`/api/playlists/${id}/share`, {
      method: "PUT",
      body: JSON.stringify({ is_shared: isShared })
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
    return `/api/stream/${songId}`;
  },
  thumbnailUrl(songId: number) {
    return `/api/thumbnails/${songId}`;
  }
};
