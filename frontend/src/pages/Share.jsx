import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Share() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchShared = () => api.get(`/notes/${id}/shared`).then((r) => setSharedUsers(r.data));

  useEffect(() => {
    api.get(`/notes/${id}`).then((r) => setNote(r.data));
    fetchShared();
  }, [id]);

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/notes/${id}/share`, { username });
      setSuccess(`Shared with "${username}" successfully.`);
      setError('');
      setUsername('');
      fetchShared();
    } catch (err) {
      setError(err.response?.data?.message || 'User not found.');
      setSuccess('');
    }
  };

  const handleRevoke = async (shareId) => {
    if (!window.confirm('Remove access for this user?')) return;
    await api.delete(`/notes/${id}/share/${shareId}`);
    fetchShared();
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
          <Link to={`/editor/${id}`} className="btn btn-ghost btn-sm">
            ← Back to note
          </Link>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            Dashboard
          </Link>
        </div>
      </nav>
      <div className="share-layout">
        <div className="dashboard-header">
          <h1>Share <em style={{ color: 'var(--gold)' }}>note</em></h1>
          {note && (
            <p style={{ color: 'var(--cream3)', fontSize: '0.9rem', marginTop: 6 }}>
              "{note.title}"
            </p>
          )}
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <form onSubmit={handleShare}>
          <label style={{ marginBottom: 10, display: 'block' }}>
            Add a collaborator by username
          </label>
          <div className="share-input-row">
            <input
              type="text"
              placeholder="Enter username..."
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
              Share →
            </button>
          </div>
        </form>

        <div className="divider" />
        <h3>Shared with ({sharedUsers.length})</h3>

        {sharedUsers.length === 0 ? (
          <p style={{ color: 'var(--cream3)', fontSize: '0.875rem' }}>No collaborators yet.</p>
        ) : (
          <div className="shared-list">
            {sharedUsers.map((u) => (
              <div className="shared-user-row" key={u.shareId}>
                <div className="shared-user-name">
                  <div className="avatar">{u.username[0].toUpperCase()}</div>
                  {u.username}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleRevoke(u.shareId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
