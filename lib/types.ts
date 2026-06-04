export type SearchResult = {
  youtube_id: string;
  title: string;
  artist: string;
  duration: number | null;
  thumbnail: string | null;
  webpage_url: string;
};

export type Song = {
  id: number;
  youtube_id: string;
  title: string;
  artist: string;
  duration: number | null;
  file_path: string;
  thumbnail_path: string | null;
  source_url: string;
  play_count: number;
  favorite: 0 | 1;
  downloaded_at: string;
  deleted: 0 | 1;
  deleted_at: string | null;
  downloaded_by_client_id: number | null;
  downloaded_by_username: string | null;
};

export type Playlist = {
  id: number;
  name: string;
  created_by_client_id: number | null;
  created_by_username: string | null;
  is_shared: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type DownloadJob = {
  id: number;
  youtube_id: string;
  title: string;
  status: "queued" | "downloading" | "processing" | "completed" | "failed";
  progress: number;
  error_message: string | null;
  requested_by_client_id: number | null;
  requested_by_username: string | null;
  created_at: string;
  updated_at: string;
};

export type ConnectedClient = {
  id: string;
  userId: number | null;
  username: string;
  avatarPath?: string;
  connectedAt: string;
  lastSeenAt: string;
  userAgent: string;
  ipAddress: string;
  origin: string | null;
  path: string | null;
  isAdmin: boolean;
};

export type ClientUser = {
  id: number;
  username: string;
  avatarPath: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  sessionCount?: number;
};

export type ToolStatus = {
  name: "yt-dlp" | "ffmpeg";
  configuredPath: string;
  resolvedPath: string | null;
  available: boolean;
};
