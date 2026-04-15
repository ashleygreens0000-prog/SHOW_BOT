import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Movie, Request } from '../types';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('movies')
        .select(`*, files:movie_files(*)`)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setMovies((data as Movie[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  return { movies, loading, error, refetch: fetchMovies };
}

export function useMovieDetails(movieId: string | null) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) { setMovie(null); return; }
    setLoading(true);
    supabase
      .from('movies')
      .select(`*, files:movie_files(*), episodes:series_episodes(*, files:episode_files(*))`)
      .eq('id', movieId)
      .maybeSingle()
      .then(({ data }) => {
        setMovie(data as Movie | null);
        setLoading(false);
      });
  }, [movieId]);

  return { movie, loading };
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as Request[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const submitRequest = async (payload: {
    telegram_user_id: number;
    username?: string;
    full_name?: string;
    movie_title: string;
    genre?: string;
    notes?: string;
  }) => {
    const { error } = await supabase.from('requests').insert([payload]);
    if (!error) fetchRequests();
    return { error };
  };

  const updateStatus = async (id: string, status: 'pending' | 'fulfilled' | 'rejected') => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id);
    if (!error) fetchRequests();
    return { error };
  };

  return { requests, loading, submitRequest, updateStatus, refetch: fetchRequests };
}

export function useAdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('movies')
      .select(`*, files:movie_files(*)`)
      .order('created_at', { ascending: false });
    setMovies((data as Movie[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const toggleVisibility = async (id: string, visible: boolean) => {
    await supabase.from('movies').update({ is_visible: visible }).eq('id', id);
    fetchMovies();
  };

  const updateAbout = async (id: string, about: string) => {
    await supabase.from('movies').update({ about, updated_at: new Date().toISOString() }).eq('id', id);
    fetchMovies();
  };

  const deleteMovie = async (id: string) => {
    await supabase.from('movies').delete().eq('id', id);
    fetchMovies();
  };

  const deleteFile = async (fileId: string) => {
    await supabase.from('movie_files').delete().eq('id', fileId);
    fetchMovies();
  };

  return { movies, loading, toggleVisibility, updateAbout, deleteMovie, deleteFile, refetch: fetchMovies };
}
