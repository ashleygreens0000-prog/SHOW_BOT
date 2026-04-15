import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Film, Tv, Calendar, Tag, Play, ChevronDown } from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovies';
import type { Movie, MovieFile, SeriesEpisode } from '../types';

interface Props {
  movieId: string;
  onBack: () => void;
  onDownload: (movie: Movie, files: MovieFile[]) => void;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function MovieDetails({ movieId, onBack, onDownload }: Props) {
  const { movie, loading } = useMovieDetails(movieId);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(1);
  const [showFullAbout, setShowFullAbout] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [movieId]);

  if (loading || !movie) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(201,168,76,0.3)',
          borderTop: '2px solid var(--gold)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const trailerYtId = movie.trailer_url ? getYouTubeId(movie.trailer_url) : null;

  const seasons = movie.type === 'series' && movie.episodes
    ? [...new Set(movie.episodes.map(e => e.season))].sort((a, b) => a - b)
    : [];

  const episodesBySeason = (season: number): SeriesEpisode[] =>
    (movie.episodes ?? []).filter(e => e.season === season).sort((a, b) => a.episode_number - b.episode_number);

  const aboutText = movie.about ?? '';
  const isLong = aboutText.length > 150;

  return (
    <div className="scrollbar-hide modal-enter" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: 'brightness(0.7)'
            }}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.src = 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.95) 100%)'
          }} />

          <button
            onClick={onBack}
            style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '8px 12px',
              color: '#f0ece4', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontFamily: "'Inter', sans-serif"
            }}
          >
            <ArrowLeft size={15} />
          </button>

          <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={`type-pill type-${movie.type}`}>
                {movie.type === 'movie' ? <><Film size={9} style={{ display: 'inline', marginRight: 3 }} />Movie</> : <><Tv size={9} style={{ display: 'inline', marginRight: 3 }} />Series</>}
              </span>
              <span className="genre-badge">{movie.genre}</span>
              {movie.release_year && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <Calendar size={10} />
                  {movie.release_year}
                </span>
              )}
            </div>
            <h1 className="font-lora" style={{
              fontSize: 26, fontWeight: 600, margin: 0,
              color: '#f0ece4', lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {movie.title}
            </h1>
          </div>
        </div>

        <div style={{ padding: '20px 16px 100px' }}>
          {aboutText && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--text-secondary)', margin: 0
              }}>
                {isLong && !showFullAbout ? `${aboutText.slice(0, 150)}...` : aboutText}
              </p>
              {isLong && (
                <button
                  onClick={() => setShowFullAbout(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--gold)', fontSize: 13, padding: '4px 0',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {showFullAbout ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {trailerYtId && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Play size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Trailer
                </span>
              </div>
              <div className="trailer-embed">
                <iframe
                  width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${trailerYtId}?rel=0&modestbranding=1`}
                  title="Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          )}

          {movie.type === 'movie' && (movie.files ?? []).length > 0 && (
            <button
              className="btn-gold"
              onClick={() => onDownload(movie, movie.files ?? [])}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={16} />
              Download
            </button>
          )}

          {movie.type === 'series' && seasons.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Tag size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Episodes
                </span>
              </div>
              {seasons.map(season => (
                <div key={season} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setExpandedSeason(expandedSeason === season ? null : season)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '12px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: expandedSeason === season ? '10px 10px 0 0' : 10,
                      color: 'var(--text-primary)', cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500
                    }}
                  >
                    <span>Season {season}</span>
                    <ChevronDown
                      size={15}
                      style={{
                        transition: 'transform 0.2s ease',
                        transform: expandedSeason === season ? 'rotate(180deg)' : 'none',
                        color: 'var(--gold)'
                      }}
                    />
                  </button>
                  {expandedSeason === season && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderTop: 'none', borderRadius: '0 0 10px 10px',
                      overflow: 'hidden'
                    }}>
                      {episodesBySeason(season).map((ep, idx) => (
                        <div
                          key={ep.id}
                          style={{
                            padding: '11px 14px',
                            borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginRight: 8 }}>
                              E{ep.episode_number}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {ep.title || `Episode ${ep.episode_number}`}
                            </span>
                          </div>
                          {(ep.files ?? []).length > 0 && (
                            <button
                              onClick={() => onDownload(movie, ep.files?.map(f => ({ ...f, movie_id: movie.id })) ?? [])}
                              style={{
                                background: 'rgba(201,168,76,0.12)',
                                border: '1px solid rgba(201,168,76,0.3)',
                                borderRadius: 8, padding: '5px 10px',
                                color: 'var(--gold-light)', cursor: 'pointer',
                                fontSize: 11, fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
                                display: 'flex', alignItems: 'center', gap: 4
                              }}
                            >
                              <Download size={11} />
                              Get
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
