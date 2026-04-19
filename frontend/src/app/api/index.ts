import { Episode, Season, Series, User, UserProgress, WatchedEpisode } from '../types';

const DEFAULT_API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.detail
      ? typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail)
      : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

const toId = (value: string | number) => String(value);

export const usersApi = {
  getAll(): Promise<User[]> {
    return request<User[]>('/users/');
  },

  getById(userId: string | number): Promise<User> {
    return request<User>(`/users/${toId(userId)}`);
  },

  create(data: { username: string; email: string }): Promise<User> {
    return request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(userId: string | number, data: { username?: string; email?: string }): Promise<User> {
    return request<User>(`/users/${toId(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const seriesApi = {
  getAll(title?: string): Promise<Series[]> {
    const query = title ? `?title=${encodeURIComponent(title)}` : '';
    return request<Series[]>(`/series/${query}`);
  },

  getById(seriesId: string | number): Promise<Series> {
    return request<Series>(`/series/${toId(seriesId)}`);
  },

  create(data: Omit<Series, 'id' | 'created_at'>): Promise<Series> {
    return request<Series>('/series/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(seriesId: string | number, data: Partial<Series>): Promise<Series> {
    return request<Series>(`/series/${toId(seriesId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(seriesId: string | number): Promise<void> {
    return request<void>(`/series/${toId(seriesId)}`, {
      method: 'DELETE',
    });
  },
};

export const seasonsApi = {
  getBySeries(seriesId: string | number): Promise<Season[]> {
    return request<Season[]>(`/series/${toId(seriesId)}/seasons`);
  },

  getById(seasonId: string | number): Promise<Season> {
    return request<Season>(`/seasons/${toId(seasonId)}`);
  },

  create(seriesId: string | number, data: { season_number: number; release_year?: number | null }): Promise<Season> {
    return request<Season>(`/series/${toId(seriesId)}/seasons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(seasonId: string | number, data: Partial<Season>): Promise<Season> {
    return request<Season>(`/seasons/${toId(seasonId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(seasonId: string | number): Promise<void> {
    return request<void>(`/seasons/${toId(seasonId)}`, {
      method: 'DELETE',
    });
  },
};

export const episodesApi = {
  getBySeason(seasonId: string | number): Promise<Episode[]> {
    return request<Episode[]>(`/seasons/${toId(seasonId)}/episodes`);
  },

  getById(episodeId: string | number): Promise<Episode> {
    return request<Episode>(`/episodes/${toId(episodeId)}`);
  },

  create(
    seasonId: string | number,
    data: { episode_number: number; title: string; duration_minutes?: number | null; synopsis?: string | null },
  ): Promise<Episode> {
    return request<Episode>(`/seasons/${toId(seasonId)}/episodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(
    episodeId: string | number,
    data: { episode_number?: number; title?: string; duration_minutes?: number | null; synopsis?: string | null },
  ): Promise<Episode> {
    return request<Episode>(`/episodes/${toId(episodeId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(episodeId: string | number): Promise<void> {
    return request<void>(`/episodes/${toId(episodeId)}`, {
      method: 'DELETE',
    });
  },
};

export const watchedApi = {
  markAsWatched(data: { user_id: number; episode_id: number; rating?: number }): Promise<WatchedEpisode> {
    return request<WatchedEpisode>('/watched-episodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUserHistory(userId: string | number): Promise<WatchedEpisode[]> {
    return request<WatchedEpisode[]>(`/users/${toId(userId)}/history`);
  },

  getUserProgress(userId: string | number, seriesId: string | number): Promise<UserProgress> {
    return request<UserProgress>(`/users/${toId(userId)}/progress/${toId(seriesId)}`);
  },

  async isEpisodeWatched(userId: string | number, episodeId: string | number): Promise<boolean> {
    const history = await this.getUserHistory(userId);
    return history.some((item) => item.episode_id === Number(episodeId));
  },
};
