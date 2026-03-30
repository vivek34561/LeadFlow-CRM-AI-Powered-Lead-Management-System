'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Lead, LeadUpdate } from '@/lib/types';
import { ScoreBadge, StatusBadge, FollowupBar } from '@/components/Badges';
import { ArrowLeft, Edit3, X, Check, RefreshCw, Mail, User, Calendar, DollarSign, Target, Clock, Zap } from 'lucide-react';

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editScore, setEditScore] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/leads/${id}`).then(r => {
      setLead(r.data);
      setEditStatus(r.data.status);
      setEditScore(r.data.score.toUpperCase());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const saveEdit = async () => {
    if (!lead) return;
    setSaving(true);
    const payload: LeadUpdate = { status: editStatus, score: editScore };
    const r = await api.patch(`/leads/${lead.id}`, payload).catch(() => null);
    if (r) setLead(r.data);
    setSaving(false);
    setShowEdit(false);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      <RefreshCw size={32} className="spinning" style={{ margin: '0 auto 12px', display: 'block' }} />
      Loading lead…
    </div>
  );

  if (!lead) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <div className="empty-state-text">Lead not found</div>
      <button className="btn-secondary" onClick={() => router.back()} style={{ marginTop: 12 }}>Go back</button>
    </div>
  );

  const scoreColor: Record<string, string> = { HOT: 'var(--hot)', Hot: 'var(--hot)', WARM: 'var(--warm)', Warm: 'var(--warm)', COLD: 'var(--cold)', Cold: 'var(--cold)' };

  return (
    <div>
      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="topnav-btn" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{lead.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lead #{lead.id} · {lead.source || 'Unknown source'}</div>
        </div>
        <ScoreBadge score={lead.score} />
        <StatusBadge status={lead.status} />
        <button className="btn-primary" onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
          <Edit3 size={14} /> Edit Lead
        </button>
      </div>

      {/* Score banner */}
      <div className="card" style={{ marginBottom: 20, borderLeft: `3px solid ${scoreColor[lead.score] || 'var(--accent)'}` }}>
        <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 36 }}>{lead.score === 'HOT' || lead.score === 'Hot' ? '🔥' : lead.score === 'WARM' || lead.score === 'Warm' ? '🌤️' : '❄️'}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>AI Score: {lead.score.toUpperCase()}</div>
            <div className="explanation-box">{lead.score_explanation || 'No explanation provided'}</div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Contact Info */}
        <div className="card">
          <div className="card-header"><div className="card-title"><User size={15} /> Contact Info</div></div>
          <div className="card-body">
            <div className="detail-grid" style={{ gap: 16 }}>
              <div className="detail-field">
                <span className="detail-field-label">Full Name</span>
                <span className="detail-field-value">{lead.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label"><Mail size={11} style={{ display: 'inline' }} /> Email</span>
                <span className="detail-field-value" style={{ fontSize: 13 }}>{lead.email}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Source</span>
                <span className="detail-field-value">{lead.source || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">User ID</span>
                <span className="detail-field-value" style={{ fontFamily: 'monospace', fontSize: 13 }}>—</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Intelligence */}
        <div className="card">
          <div className="card-header"><div className="card-title"><Zap size={15} /> Lead Intelligence</div></div>
          <div className="card-body">
            <div className="detail-grid" style={{ gap: 16 }}>
              <div className="detail-field">
                <span className="detail-field-label"><Target size={11} style={{ display: 'inline' }} /> Interest</span>
                <span className="detail-field-value">{lead.interest || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label"><DollarSign size={11} style={{ display: 'inline' }} /> Budget</span>
                <span className="detail-field-value">{lead.budget || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label"><Clock size={11} style={{ display: 'inline' }} /> Timeline</span>
                <span className="detail-field-value">{lead.timeline || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Intent</span>
                <span className="detail-field-value">{lead.intent || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Status */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title"><Calendar size={15} /> CRM Status</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <div className="detail-field">
              <span className="detail-field-label">Status</span>
              <StatusBadge status={lead.status} />
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Follow-up Progress</span>
              <FollowupBar count={lead.followup_count} />
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Submitted</span>
              <span className="detail-field-value" style={{ fontSize: 13 }}>{new Date(lead.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Last Updated</span>
              <span className="detail-field-value" style={{ fontSize: 13 }}>{new Date(lead.updated_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="modal">
            <div className="modal-title">Edit Lead</div>
            <div className="modal-subtitle">{lead.name} · #{lead.id}</div>

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
              <button className="btn-secondary" onClick={() => setShowEdit(false)}><X size={13} style={{ display: 'inline', marginRight: 4 }} />Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? <RefreshCw size={13} className="spinning" style={{ display: 'inline', marginRight: 4 }} /> : <Check size={13} style={{ display: 'inline', marginRight: 4 }} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
