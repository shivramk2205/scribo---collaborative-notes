import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Sign in now.');
      setError('');
    } catch (err) {
      setError('Username already taken. Try another.');
      setSuccess('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span className="brand-name">Scribo</span>
        </div>
        <h1>Create account</h1>
        <p className="subtitle">Start capturing your thoughts</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && (
          <div className="alert alert-success">
            ✓ {success} <Link to="/login">Sign in →</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="choose a username"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            Create account →
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
