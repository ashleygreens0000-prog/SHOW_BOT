import { useState } from 'react';
import { Trash2, Eye, EyeOff, CreditCard as Edit3, Check, X, Film, Inbox, ChevronDown, ChevronRight } from 'lucide-react';
import { useAdminMovies, useRequests } from '../hooks/useMovies';
import type { Movie } from '../types';

type AdminTab = 'content' | 'requests';

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('content');
  const { movies, loading, toggleVisibility, updateAbout, deleteMovie, deleteFile } = useAdminMovies();
  const { requests, loading: reqLoading, updateStatus } = useRequests();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingAbout, setEditingAbout] = useState<string | null>(null);
  const [aboutDraft, setAboutDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const startEditAbout = (movie: Movie) => {
    setEditingAbout(movie.id);
    setAboutDraft(movie.about ?? '');
  };

  const saveAbout = async (id: string) => {
    await updateAbout(id, aboutDraft);
    setEditingAbout(null);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 100px' }} className="scrollbar-hide">
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
          <h2 className="font-lora" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--gold-light)' }}>
            Admin Panel
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          {movies.length} titles · {requests.filter(r => r.status === 'pending').length} pending requests
        </p>
      </div>

      <div style={{ display: 'flex', padding: '0 16px', gap: 8, marginBottom: 16 }}>
        {(['content', 'requests'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '9px 0',
              borderRadius: 10, border: '1px solid',
              borderColor: tab === t ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.07)',
              background: tab === t ? 'rgba(201,168,76,0.1)' : 'var(--bg-elevated)',
              color: tab === t ? 'var(--gold-light)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            {t === 'content' ? <Film size={13} /> : <Inbox size={13} />}
            {t === 'content' ? 'Content' : 'Requests'}
            {t === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{
                background: 'var(--gold)', color: '#000',
                borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700
              }}>
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {tab === 'content' && (
          loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>Loading...</p>
          ) : (
            <div>
              {movies.map(movie => (
                <div key={movie.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, marginBottom: 8, overflow: 'hidden'
                }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '12px 14px', gap: 10, cursor: 'pointer'
                    }}
                    onClick={() => setExpanded(expanded === movie.id ? null : movie.id)}
                  >
                    <img
                      src={movie.poster_url}
                      style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`type-pill type-${movie.type}`}>{movie.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{movie.genre}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleVisibility(movie.id, !movie.is_visible); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: movie.is_visible ? '#34d399' : 'var(--text-muted)', padding: 4 }}
                        title={movie.is_visible ? 'Hide' : 'Show'}
                      >
                        {movie.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      {expanded === movie.id ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>

                  {expanded === movie.id && (
                    <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                            About
                          </span>
                          <button
                            onClick={() => editingAbout === movie.id ? setEditingAbout(null) : startEditAbout(movie)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', padding: 0, display: 'flex' }}
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                        {editingAbout === movie.id ? (
                          <div>
                            <textarea
                              className="form-input"
                              value={aboutDraft}
                              onChange={e => setAboutDraft(e.target.value)}
                              rows={3}
                              style={{ fontSize: 13, marginBottom: 8 }}
                            />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => saveAbout(movie.id)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Check size={12} /> Save
                              </button>
                              <button onClick={() => setEditingAbout(null)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                            {movie.about || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}
                          </p>
                        )}
                      </div>

                      {(movie.files ?? []).length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                            Files
                          </span>
                          {(movie.files ?? []).map(file => (
                            <div key={file.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '7px 10px', borderRadius: 8,
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              marginBottom: 4
                            }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-light)' }}>{file.quality}</span>
                                {file.file_size && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{file.file_size}</span>}
                              </div>
                              <button
                                onClick={() => deleteFile(file.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 12 }}>
                        {confirmDelete === movie.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { deleteMovie(movie.id); setConfirmDelete(null); }} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
                              Confirm Delete
                            </button>
                            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(movie.id)}
                            style={{ width: '100%', padding: '8px 0', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <Trash2 size={13} />
                            Delete Title
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'requests' && (
          reqLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>No requests yet.</p>
          ) : (
            <div>
              {requests.map(req => (
                <div key={req.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '12px 14px', marginBottom: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{req.movie_title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {req.full_name || req.username || `User ${req.telegram_user_id}`}
                        {req.genre && <span> · {req.genre}</span>}
                      </div>
                    </div>
                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                  </div>
                  {req.notes && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.4 }}>{req.notes}</p>
                  )}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateStatus(req.id, 'fulfilled')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        Fulfill
                      </button>
                      <button onClick={() => updateStatus(req.id, 'rejected')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
