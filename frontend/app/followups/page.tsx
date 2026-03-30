'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead } from '@/lib/types';
import { ScoreBadge, StatusBadge, FollowupBar } from '@/components/Badges';
import { BellRing, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function FollowupsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/leads/pending-followups').then(r => {
      setLeads(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const hot = leads.filter(l => l.score.toLowerCase() === 'hot');
  const warm = leads.filter(l => l.score.toLowerCase() === 'warm');
  const cold = leads.filter(l => l.score.toLowerCase() === 'cold');

  const Group = ({ title, items, accent }: { title: string; items: Lead[]; accent: string }) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <div className="card-title" style={{ color: accent }}>{title}
          <span style={{ marginLeft: 8, background: `${accent}22`, color: accent, fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{items.length}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px 20px' }}>
          <div className="empty-state-text">No pending leads in this group</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Interest</th>
                <th>Budget</th>
                <th>Score</th>
                <th>Status</th>
                <th>Follow-ups</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.interest || '—'}</td>
                  <td>{lead.budget || '—'}</td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><FollowupBar count={lead.followup_count} /></td>
                  <td className="muted">{new Date(lead.updated_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <Link href={`/leads/${lead.id}`} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--accent-light)' }}>
                      View <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="section-title"><BellRing size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />Pending Follow-ups</div>
          <div className="section-subtitle">{leads.length} leads need attention</div>
        </div>
        <button className="topnav-btn" onClick={fetch}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spinning" style={{ margin: '0 auto 12px', display: 'block' }} />
          Loading pending follow-ups…
        </div>
      ) : (
        <>
          <Group title="🔥 HOT — Urgent Action Required" items={hot} accent="var(--hot)" />
          <Group title="🌤️ WARM — Keep Nurturing" items={warm} accent="var(--warm)" />
          <Group title="❄️ COLD — Awareness Emails" items={cold} accent="var(--cold)" />
        </>
      )}
    </div>
  );
}
