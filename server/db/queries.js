import { supabase } from './client.js';

export async function insertMovie(data) {
  const { data: movie, error } = await supabase
    .from('movies')
    .insert([data])
    .select()
    .single();
  return { movie, error };
}

export async function updateMovie(id, data) {
  const { error } = await supabase
    .from('movies')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error };
}

export async function insertMovieFile(data) {
  const { data: file, error } = await supabase
    .from('movie_files')
    .insert([data])
    .select()
    .single();
  return { file, error };
}

export async function insertEpisode(data) {
  const { data: episode, error } = await supabase
    .from('series_episodes')
    .insert([data])
    .select()
    .single();
  return { episode, error };
}

export async function insertEpisodeFile(data) {
  const { data: file, error } = await supabase
    .from('episode_files')
    .insert([data])
    .select()
    .single();
  return { file, error };
}

export async function getMovieById(id) {
  const { data, error } = await supabase
    .from('movies')
    .select('*, files:movie_files(*)')
    .eq('id', id)
    .maybeSingle();
  return { movie: data, error };
}

export async function getPendingRequests() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { requests: data ?? [], error };
}
