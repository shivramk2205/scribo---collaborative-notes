import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span className="brand-name">Scribo</span>
        </div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your notes</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="your username"
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
            Sign in →
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
