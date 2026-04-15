/*
  # DY SHOWS - User Requests Table

  Stores movie/series requests submitted by users through the Mini App.

  1. requests - title requests with genre, notes, and status tracking
*/

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL,
  username text DEFAULT '',
  full_name text DEFAULT '',
  movie_title text NOT NULL DEFAULT '',
  genre text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert requests"
  ON requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read requests"
  ON requests FOR SELECT USING (true);

CREATE POLICY "Service role can update requests"
  ON requests FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete requests"
  ON requests FOR DELETE TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
