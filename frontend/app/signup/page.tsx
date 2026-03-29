'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      const res = await api.post('/auth/login', { email, password });
      window.localStorage.setItem('access_token', res.data.access_token);
      router.push('/');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Create account</div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="search-input"
              placeholder="you@example.com"
            />

            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="search-input"
              placeholder="Create a strong password"
            />

            {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}

            <button
              type="submit"
              className="page-btn active"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
