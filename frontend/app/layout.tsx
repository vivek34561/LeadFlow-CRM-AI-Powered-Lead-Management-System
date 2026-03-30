import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: 'LeadIQ — AI Lead Management',
  description: 'Smart CRM dashboard powered by AI scoring and automated follow-ups',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <div className="app-shell">
            <Sidebar />
            <div className="main-content">
              <TopNav />
              <div className="page-content">{children}</div>
            </div>
          </div>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
