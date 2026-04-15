import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';
import { GENRES } from '../types';

interface Props {
  movies: Movie[];
  loading: boolean;
  onSelect: (movie: Movie) => void;
}

const FILTER_TYPES = ['All', 'Movies', 'Series'] as const;

export default function MovieGrid({ movies, loading, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<typeof FILTER_TYPES[number]>('All');
  const [filterGenre, setFilterGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' ||
      (filterType === 'Movies' && m.type === 'movie') ||
      (filterType === 'Series' && m.type === 'series');
    const matchGenre = filterGenre === 'All' || m.genre === filterGenre;
    return matchSearch && matchType && matchGenre;
  });

  if (loading) {
    return (
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 8,
              aspectRatio: '2/3',
              background: 'rgba(255,255,255,0.04)',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="scrollbar-hide">
      <div style={{ padding: '12px 14px 8px', position: 'sticky', top: 0, zIndex: 10, background: 'transparent' }}>
        <div style={{ position: 'relative', marginBottom: showFilters ? 12 : 0 }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none'
            }}
          />
          <input
            className="search-input"
            placeholder="Search movies, genres..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: showFilters ? 'var(--gold)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', padding: 4
            }}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {showFilters && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTER_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 20,
                    border: '1px solid',
                    borderColor: filterType === t ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.08)',
                    background: filterType === t ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color: filterType === t ? 'var(--gold-light)' : 'var(--text-muted)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', ...GENRES].map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGenre(g)}
                  style={{
                    padding: '4px 10px', borderRadius: 20,
                    border: '1px solid',
                    borderColor: filterGenre === g ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.06)',
                    background: filterGenre === g ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: filterGenre === g ? 'var(--gold-light)' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px', gap: 12
        }}>
          <span style={{ fontSize: 40 }}>🎬</span>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', margin: 0 }}>
            {search ? `No results for "${search}"` : 'No titles available yet'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '8px 14px 120px'
        }}>
          {filtered.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
