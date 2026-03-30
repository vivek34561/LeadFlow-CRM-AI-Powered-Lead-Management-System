import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Lead Management Dashboard',
  description: 'Smart CRM dashboard powered by AI scoring and automated follow-ups',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <TopNav />
            <div className="page-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
