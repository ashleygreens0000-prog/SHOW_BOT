import { useState } from 'react';
import { Send, CheckCircle, Clapperboard } from 'lucide-react';
import { useRequests } from '../hooks/useMovies';
import { GENRES } from '../types';
import { useTelegram } from '../hooks/useTelegram';

export default function RequestModal() {
  const { submitRequest } = useRequests();
  const { user } = useTelegram();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a title'); return; }
    setLoading(true);
    setError('');

    const { error: err } = await submitRequest({
      telegram_user_id: user?.id ?? 0,
      username: user?.username ?? '',
      full_name: [user?.first_name, (user as { last_name?: string })?.last_name].filter(Boolean).join(' '),
      movie_title: title.trim(),
      genre: genre || undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);
    if (err) { setError('Failed to submit. Try again.'); return; }
    setSuccess(true);
    setTitle(''); setGenre(''); setNotes('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 100px' }} className="scrollbar-hide">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Clapperboard size={20} style={{ color: 'var(--gold)' }} />
          <h2 className="font-lora" style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
            Request a Title
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Can't find what you're looking for? Let us know and we'll add it.
        </p>
      </div>

      {success && (
        <div className="slide-up" style={{
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.25)',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
        }}>
          <CheckCircle size={18} style={{ color: '#34d399', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#34d399' }}>Request submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Movie / Series Title *</label>
          <input
            className="form-input"
            placeholder="e.g. Oppenheimer"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Genre (optional)</label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-select"
              value={genre}
              onChange={e => setGenre(e.target.value)}
            >
              <option value="">Select genre...</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <svg
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes (optional)</label>
          <textarea
            className="form-input"
            placeholder="Year, director, streaming platform..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn-gold"
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.3)',
                borderTop: '2px solid #000',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block'
              }} />
              Submitting...
            </span>
          ) : (
            <>
              <Send size={15} />
              Submit Request
            </>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
}
