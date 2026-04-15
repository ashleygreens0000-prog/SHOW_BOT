/*
  # DY SHOWS - Series Episodes and Episode Files Tables

  Creates the episode structure for series content.

  1. series_episodes - season/episode entries linked to a series movie
  2. episode_files - Telegram file_ids per quality for each episode
*/

CREATE TABLE IF NOT EXISTS series_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  season int NOT NULL DEFAULT 1,
  episode_number int NOT NULL DEFAULT 1,
  title text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE series_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read episodes"
  ON series_episodes FOR SELECT USING (true);

CREATE POLICY "Service role can insert episodes"
  ON series_episodes FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update episodes"
  ON series_episodes FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete episodes"
  ON series_episodes FOR DELETE TO service_role USING (true);

CREATE TABLE IF NOT EXISTS episode_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL REFERENCES series_episodes(id) ON DELETE CASCADE,
  quality text NOT NULL DEFAULT '1080p',
  file_id text NOT NULL DEFAULT '',
  file_size text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE episode_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read episode files"
  ON episode_files FOR SELECT USING (true);

CREATE POLICY "Service role can insert episode files"
  ON episode_files FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update episode files"
  ON episode_files FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete episode files"
  ON episode_files FOR DELETE TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_series_episodes_movie_id ON series_episodes(movie_id);
CREATE INDEX IF NOT EXISTS idx_episode_files_episode_id ON episode_files(episode_id);
