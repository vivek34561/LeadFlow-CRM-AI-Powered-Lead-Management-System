'use client';
import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Lead, LeadUpdate } from '@/lib/types';
import { ScoreBadge, StatusBadge, FollowupBar } from '@/components/Badges';
import { Search, RefreshCw, Edit3, X, Check } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 20;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [page, setPage] = useState(1);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editScore, setEditScore] = useState('');
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Lead>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    api.get('/leads?limit=1000').then(r => { setLeads(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = useMemo(() => {
    let d = [...leads];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      d = d.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    }
    if (filterScore) d = d.filter(l => l.score.toLowerCase() === filterScore.toLowerCase());
    if (filterStatus) d = d.filter(l => l.status.toLowerCase() === filterStatus.toLowerCase());
    if (filterBudget) d = d.filter(l => l.budget?.toLowerCase() === filterBudget.toLowerCase());
    d.sort((a, b) => {
      const av = (a[sortKey] ?? '') as string, bv = (b[sortKey] ?? '') as string;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return d;
  }, [leads, searchQ, filterScore, filterStatus, filterBudget, sortKey, sortAsc]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const sort = (key: keyof Lead) => {
    if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setEditStatus(lead.status);
    setEditScore(lead.score.toUpperCase());
  };

  const saveEdit = async () => {
    if (!editLead) return;
    setSaving(true);
    const payload: LeadUpdate = { status: editStatus, score: editScore };
    await api.patch(`/leads/${editLead.id}`, payload).catch(() => { });
    setSaving(false);
    setEditLead(null);
    fetchLeads();
  };

  const SortArrow = ({ k }: { k: keyof Lead }) =>
    sortKey === k ? <span style={{ fontSize: 10 }}>{sortAsc ? '▲' : '▼'}</span> : null;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">All Leads</div>
          <div className="section-subtitle">{filtered.length} leads found</div>
        </div>
        <button className="topnav-btn" onClick={fetchLeads}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name or email…"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setPage(1); }}
            />
          </div>

          <select className="filter-select" value={filterScore} onChange={e => { setFilterScore(e.target.value); setPage(1); }}>
            <option value="">All Scores</option>
            <option value="hot">🔥 HOT</option>
            <option value="warm">🌤️ WARM</option>
            <option value="cold">❄️ COLD</option>
          </select>

          <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>

          <select className="filter-select" value={filterBudget} onChange={e => { setFilterBudget(e.target.value); setPage(1); }}>
            <option value="">All Budgets</option>
            <option value="High">💎 High</option>
            <option value="Medium">🔹 Medium</option>
            <option value="Low">📉 Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sort('name')}>Lead <SortArrow k="name" /></th>
                <th onClick={() => sort('interest')}>Interest <SortArrow k="interest" /></th>
                <th onClick={() => sort('budget')}>Budget <SortArrow k="budget" /></th>
                <th onClick={() => sort('timeline')}>Timeline <SortArrow k="timeline" /></th>
                <th onClick={() => sort('score')}>Score <SortArrow k="score" /></th>
                <th onClick={() => sort('status')}>Status <SortArrow k="status" /></th>
                <th onClick={() => sort('followup_count')}>Follow-ups <SortArrow k="followup_count" /></th>
                <th onClick={() => sort('created_at')}>Date <SortArrow k="created_at" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div className="skeleton skeleton-row" style={{ width: '80%', height: 16 }} /></td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-text">No leads found</div>
                    <div className="empty-state-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              ) : paged.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                    </Link>
                  </td>
                  <td>{lead.interest || '—'}</td>
                  <td>{lead.budget || '—'}</td>
                  <td style={{ fontSize: 12 }}>{lead.timeline || '—'}</td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><FollowupBar count={lead.followup_count} /></td>
                  <td className="muted">{new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <button
                      onClick={() => openEdit(lead)}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </div>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return p <= totalPages ? (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ) : null;
            })}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editLead && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditLead(null)}>
          <div className="modal">
            <div className="modal-title">Edit Lead</div>
            <div className="modal-subtitle">{editLead.name} · {editLead.email}</div>

            <div className="modal-field">
              <label className="modal-label">Status</label>
              <select className="modal-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Score</label>
              <select className="modal-select" value={editScore} onChange={e => setEditScore(e.target.value)}>
                <option value="HOT">🔥 HOT</option>
                <option value="WARM">🌤️ WARM</option>
                <option value="COLD">❄️ COLD</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditLead(null)}>
                <X size={14} style={{ display: 'inline', marginRight: 4 }} /> Cancel
              </button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? <RefreshCw size={14} className="spinning" style={{ display: 'inline', marginRight: 4 }} /> : <Check size={14} style={{ display: 'inline', marginRight: 4 }} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
