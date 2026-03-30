'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BarChart3, BellRing, Zap
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/followups', label: 'Follow-ups', icon: BellRing },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">LeadIQ</div>
          <div className="sidebar-logo-sub">AI Lead Management</div>
        </div>
      </div>

      <div className="sidebar-section-label">Main Menu</div>
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={18} className="sidebar-link-icon" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-dot" />
          Backend connected
        </div>
      </div>
    </aside>
  );
}
