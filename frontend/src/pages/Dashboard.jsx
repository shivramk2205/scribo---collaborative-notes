import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [lastNote, setLastNote] = useState(null);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notes').then((res) => setNotes(res.data));
    const last = document.cookie.split('; ').find((r) => r.startsWith('last_note='));
    if (last) setLastNote(last.split('=')[1]);
  }, []);

  const logout = () => {
    localStorage.clear();
    document.cookie = 'last_note=; max-age=0; path=/';
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand-icon" style={{ width: 28, height: 28, fontSize: 13 }}>
            ✦
          </div>
          <span className="brand-name" style={{ fontSize: 15 }}>Scribo</span>
        </div>
        <div className="nav-actions">
          <span className="nav-username">
            Signed in as <span>{username}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>
      <div className="dashboard-body">
        <div className="dashboard-header">
          <h1>Your <em>notes</em></h1>
          <p style={{ color: 'var(--cream3)', fontSize: '0.9rem', marginTop: 6 }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {lastNote && (
          <div className="last-note-banner">
            <p>✦ Continue where you left off</p>
            <Link to={`/editor/${lastNote}`}>Open last note →</Link>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h3>All notes</h3>
          <Link to="/editor/new" className="btn btn-ghost btn-sm">
            + New note
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✦</div>
            <p>No notes yet. Create your first one.</p>
            <Link
              to="/editor/new"
              className="btn btn-primary"
              style={{ width: 'auto', display: 'inline-flex' }}
            >
              Create note →
            </Link>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <Link to={`/editor/${note.id}`} className="note-card" key={note.id}>
                <div className="note-card-title">{note.title}</div>
                <div className="note-card-preview">{note.content?.slice(0, 120)}</div>
                <div className="note-card-meta">
                  <span
                    className={`note-badge ${
                      note.role === 'owner' ? 'badge-owner' : 'badge-shared'
                    }`}
                  >
                    {note.role}
                  </span>
                  <span className="note-date">{timeAgo(note.lastUpdated)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
