import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Editor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const [note, setNote] = useState({ title: '', content: '' });
  const [status, setStatus] = useState({ text: ' ✓ Saved', cls: 'status-saved' });
  const [isOwner, setIsOwner] = useState(true);
  const saveTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew) {
      api.get(`/notes/${id}`).then((res) => {
        setNote(res.data);
        setIsOwner(res.data.owner);
        document.cookie = `last_note=${id}; max-age=${7 * 24 * 60 * 60}; path=/`;
      });
    }
  }, [id, isNew]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await api.post('/notes', note);
    navigate(`/editor/${res.data.id}`);
  };

  const handleChange = (content) => {
    setNote((n) => ({ ...n, content }));
    setStatus({ text: '● Unsaved', cls: 'status-saving' });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(content), 2000);
  };

  const autoSave = async (content) => {
    setStatus({ text: ' ↻ Saving...', cls: 'status-saving' });
    try {
      await api.put(`/notes/${id}`, { ...note, content });
      setStatus({
        text: ` ✓ Saved ${new Date().toLocaleTimeString()}`,
        cls: 'status-saved',
      });
    } catch {
      setStatus({ text: ' ✗ Failed', cls: 'status-error' });
    }
  };

  if (isNew) {
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
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              ← Dashboard
            </Link>
          </div>
        </nav>
        <div className="editor-layout">
          <div className="dashboard-header">
            <h1>New <em style={{ color: 'var(--gold)' }}>note</em></h1>
          </div>
          <form onSubmit={handleCreate}>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Title</label>
              <input
                type="text"
                placeholder="Note title..."
                required
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Content</label>
              <textarea
                placeholder="Start writing..."
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                Create note →
              </button>
              <Link to="/dashboard" className="btn btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </>
    );
  }

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
          {isOwner && (
            <Link to={`/share/${id}`} className="btn btn-ghost btn-sm">
              Share
            </Link>
          )}
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>
      </nav>
      <div className="editor-layout">
        <div className="editor-topbar">
          <div className="editor-title">{note.title}</div>
          <span id="save-status" className={status.cls}>
            {status.text}
          </span>
        </div>
        <div className="editor-meta">
          <span>
            Last updated:{' '}
            {note.lastUpdated ? new Date(note.lastUpdated).toLocaleString() : '—'}
          </span>
          {!isOwner && <span style={{ color: 'var(--green)' }}> ✦ Shared with you</span>}
        </div>
        <textarea id="editor" value={note.content} onChange={(e) => handleChange(e.target.value)} />
      </div>
    </>
  );
}
