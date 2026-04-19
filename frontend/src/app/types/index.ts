export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Series {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  release_year: number | null;
  status: string | null;
  total_seasons: number | null;
  created_at: string;
}

export interface Season {
  id: number;
  series_id: number;
  season_number: number;
  release_year: number | null;
}

export interface Episode {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  duration_minutes: number | null;
  synopsis: string | null;
}

export interface WatchedEpisode {
  id: number;
  user_id: number;
  episode_id: number;
  watched_at: string;
  rating?: number;
}

export interface HistoryItem {
  id: number;
  series_title: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
  watched_at: string;
  rating?: number;
}

export interface UserProgress {
  series_id: number;
  total_episodes: number;
  watched_episodes: number;
  progress_percent: number;
}

export interface NextEpisode {
  episode_id: number;
  episode_number: number;
  episode_title: string;
  season_id: number;
  season_number: number;
  series_id: number;
  series_title: string;
  synopsis: string | null;
  duration_minutes: number | null;
}

export interface UserStatistics {
  total_watched: number;
  total_time_minutes: number;
  series_in_progress: number;
  series_completed: number;
  average_rating: number;
  total_series: number;
}

export interface SeriesWithProgress extends Series {
  progress?: UserProgress;
}
