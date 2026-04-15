/*
  # DY SHOWS - Movies and Movie Files Tables

  Creates the core content tables for movies/series and their download files.

  1. movies - stores all titles (movies and series) with genre, poster, trailer, etc.
  2. movie_files - stores Telegram file_ids per quality for each movie
*/

CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  poster_url text NOT NULL DEFAULT '',
  trailer_url text DEFAULT '',
  about text DEFAULT '',
  type text NOT NULL DEFAULT 'movie' CHECK (type IN ('movie', 'series')),
  genre text NOT NULL DEFAULT 'Action',
  release_year int DEFAULT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible movies"
  ON movies FOR SELECT USING (is_visible = true);

CREATE POLICY "Service role can insert movies"
  ON movies FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update movies"
  ON movies FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete movies"
  ON movies FOR DELETE TO service_role USING (true);

CREATE TABLE IF NOT EXISTS movie_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  quality text NOT NULL DEFAULT '1080p',
  file_id text NOT NULL DEFAULT '',
  file_size text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movie_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read movie files"
  ON movie_files FOR SELECT USING (true);

CREATE POLICY "Service role can insert movie files"
  ON movie_files FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update movie files"
  ON movie_files FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete movie files"
  ON movie_files FOR DELETE TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_visible ON movies(is_visible);
CREATE INDEX IF NOT EXISTS idx_movie_files_movie_id ON movie_files(movie_id);
