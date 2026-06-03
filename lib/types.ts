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
};

export type Playlist = {
  id: number;
  name: string;
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
  created_at: string;
  updated_at: string;
};

export type ToolStatus = {
  name: "yt-dlp" | "ffmpeg";
  configuredPath: string;
  resolvedPath: string | null;
  available: boolean;
};
