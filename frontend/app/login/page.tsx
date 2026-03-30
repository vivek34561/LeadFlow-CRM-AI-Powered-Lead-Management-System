'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, GoogleCredentialResponse } from '@react-oauth/google';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setError('Google login failed');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { id_token: response.credential });
      window.localStorage.setItem('access_token', res.data.access_token);
      router.push('/');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Sign in</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Sign in with your Google account to access the dashboard.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              shape="pill"
              size="large"
              theme="outline"
            />
            {loading && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Signing you in…</div>}
            {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
