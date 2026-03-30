'use client';
'use client';

import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="page-content" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Authentication Disabled</div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Account creation is no longer required. You can access the dashboard directly.
          </p>
          <Link href="/" className="page-btn active" style={{ display: 'inline-block', marginTop: 12 }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
