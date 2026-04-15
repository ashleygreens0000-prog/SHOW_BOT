import { X, Download, FileVideo } from 'lucide-react';
import type { Movie, MovieFile } from '../types';

interface Props {
  movie: Movie;
  files: MovieFile[];
  onClose: () => void;
}

const QUALITY_ORDER = ['4K', '2160p', '1080p', '720p', '480p', 'Web-DL', 'WEB-DL', 'HD', 'SD'];

function sortFiles(files: MovieFile[]): MovieFile[] {
  return [...files].sort((a, b) => {
    const ai = QUALITY_ORDER.findIndex(q => a.quality.includes(q));
    const bi = QUALITY_ORDER.findIndex(q => b.quality.includes(q));
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function qualityColor(quality: string): string {
  if (quality.includes('4K') || quality.includes('2160')) return '#e8c96e';
  if (quality.includes('1080')) return '#93c5fd';
  if (quality.includes('720')) return '#86efac';
  if (quality.includes('480')) return '#fca5a5';
  return '#9e9e9e';
}

export default function DownloadModal({ movie, files, onClose }: Props) {
  const sorted = sortFiles(files);

  const handleDownload = (file: MovieFile) => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify({ action: 'download', file_id: file.file_id, quality: file.quality }));
    } else if (botUsername) {
      window.open(`https://t.me/${botUsername}?start=dl_${file.file_id}`, '_blank');
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter"
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 40px',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 className="font-lora" style={{ margin: 0, fontSize: 19, fontWeight: 600, color: 'var(--text-primary)' }}>
              {movie.title}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Select download quality
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: 8, padding: 8, cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((file) => (
            <button
              key={file.id}
              className="quality-btn"
              onClick={() => handleDownload(file)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileVideo size={16} style={{ color: qualityColor(file.quality) }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: qualityColor(file.quality) }}>
                    {file.quality}
                  </div>
                  {file.file_size && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {file.file_size}
                    </div>
                  )}
                </div>
              </div>
              <Download size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {sorted.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>
            No download files available yet.
          </p>
        )}
      </div>
    </div>
  );
}
