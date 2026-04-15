import { useState, useEffect } from 'react';
import { Home, Search, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import DynamicBackground from './components/DynamicBackground';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import DownloadModal from './components/DownloadModal';
import RequestModal from './components/RequestModal';
import AdminPanel from './components/AdminPanel';
import { useMovies } from './hooks/useMovies';
import { useTelegram } from './hooks/useTelegram';
import type { Movie, MovieFile, TabType } from './types';

export default function App() {
  const { movies, loading } = useMovies();
  const { isAdmin, ready, expand } = useTelegram();
  const [tab, setTab] = useState<TabType>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [activeBgMovie, setActiveBgMovie] = useState<Movie | null>(null);
  const [download, setDownload] = useState<{ movie: Movie; files: MovieFile[] } | null>(null);

  useEffect(() => {
    ready();
    expand();
  }, [ready, expand]);

  const handleSelectMovie = (movie: Movie) => {
    setActiveBgMovie(movie);
    setSelectedMovieId(movie.id);
  };

  const handleBack = () => {
    setSelectedMovieId(null);
    setActiveBgMovie(null);
  };

  const handleDownload = (movie: Movie, files: MovieFile[]) => {
    setDownload({ movie, files });
  };

  return (
    <div style={{
      height: '100dvh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      <DynamicBackground movies={movies} activeMovie={activeBgMovie} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '16px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #e8c96e, #9a7a30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              🎥
            </div>
            <div>
              <h1 className="font-lora gold-text" style={{
                margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}>
                DY SHOWS
              </h1>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Premium Streaming
              </p>
            </div>
          </div>
          {isAdmin && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
            }}>
              <ShieldCheck size={11} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Admin
              </span>
            </div>
          )}
        </header>

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedMovieId && tab === 'home' ? (
            <MovieDetails
              movieId={selectedMovieId}
              onBack={handleBack}
              onDownload={handleDownload}
            />
          ) : tab === 'home' ? (
            <MovieGrid
              movies={movies}
              loading={loading}
              onSelect={handleSelectMovie}
            />
          ) : tab === 'search' ? (
            <MovieGrid
              movies={movies}
              loading={loading}
              onSelect={movie => { setTab('home'); handleSelectMovie(movie); }}
            />
          ) : tab === 'request' ? (
            <RequestModal />
          ) : tab === 'admin' && isAdmin ? (
            <AdminPanel />
          ) : null}
        </main>

        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '6px 0 env(safe-area-inset-bottom, 6px)',
          zIndex: 50,
        }}>
          <NavItem icon={<Home size={20} />} label="Home" active={tab === 'home' && !selectedMovieId} onClick={() => { setTab('home'); setSelectedMovieId(null); setActiveBgMovie(null); }} />
          <NavItem icon={<Search size={20} />} label="Search" active={tab === 'search'} onClick={() => { setTab('search'); setSelectedMovieId(null); }} />
          <NavItem icon={<MessageSquarePlus size={20} />} label="Request" active={tab === 'request'} onClick={() => setTab('request')} />
          {isAdmin && (
            <NavItem icon={<ShieldCheck size={20} />} label="Admin" active={tab === 'admin'} onClick={() => setTab('admin')} />
          )}
        </nav>
      </div>

      {download && (
        <div style={{ position: 'relative', zIndex: 200 }}>
          <DownloadModal
            movie={download.movie}
            files={download.files}
            onClose={() => setDownload(null)}
          />
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-tab ${active ? 'active' : ''}`} onClick={onClick}>
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
        {active && (
          <span style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, borderRadius: '50%',
            background: 'var(--gold)', display: 'block'
          }} />
        )}
      </span>
      {label}
    </button>
  );
}
