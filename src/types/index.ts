export interface Movie {
  id: string;
  title: string;
  poster_url: string;
  trailer_url: string | null;
  about: string | null;
  type: 'movie' | 'series';
  genre: string;
  release_year: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  files?: MovieFile[];
  episodes?: SeriesEpisode[];
}

export interface MovieFile {
  id: string;
  movie_id: string;
  quality: string;
  file_id: string;
  file_size: string | null;
  created_at: string;
}

export interface SeriesEpisode {
  id: string;
  movie_id: string;
  season: number;
  episode_number: number;
  title: string | null;
  created_at: string;
  files?: EpisodeFile[];
}

export interface EpisodeFile {
  id: string;
  episode_id: string;
  quality: string;
  file_id: string;
  file_size: string | null;
  created_at: string;
}

export interface Request {
  id: string;
  telegram_user_id: number;
  username: string | null;
  full_name: string | null;
  movie_title: string;
  genre: string | null;
  notes: string | null;
  status: 'pending' | 'fulfilled' | 'rejected';
  created_at: string;
}

export type TabType = 'home' | 'search' | 'request' | 'admin';

export const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western'
] as const;

export type Genre = typeof GENRES[number];
