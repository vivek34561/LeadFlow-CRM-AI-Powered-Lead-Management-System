'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Analytics, Lead } from '@/lib/types';
import { ScoreBadge, StatusBadge, FollowupBar } from '@/components/Badges';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { Users, Flame, Thermometer, Snowflake, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';

const SCORE_COLORS = { HOT: '#ef4444', WARM: '#f59e0b', COLD: '#3b82f6' };
const CHART_COLORS = ['#e11d48', '#f59e0b', '#3b82f6', '#10b981', '#f97316', '#0ea5e9', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  New: '#22c55e', Following: '#f59e0b', Bought: '#e11d48', Expired: '#ef4444',
  NEW: '#22c55e', CONTACTED: '#f59e0b', CONVERTED: '#e11d48', CLOSED: '#ef4444',
};

function StatCard({ label, value, icon, colorClass, suffix = '' }: {
  label: string; value: number | string; icon: React.ReactNode;
  colorClass: string; suffix?: string;
}) {
  return (
    <div className={`kpi-card ${colorClass}`}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: 'rgba(0,0,0,0.04)' }}>{icon}</div>
      </div>
      <div className="kpi-value">{value}{suffix}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(r => { setAnalytics(r.data); setLoadingAnalytics(false); }).catch(() => setLoadingAnalytics(false));
    api.get('/leads?limit=500').then(r => { setLeads(r.data); setLoadingLeads(false); }).catch(() => setLoadingLeads(false));
  }, []);

  // Derived chart data
  const scoreData = analytics ? [
    { name: 'HOT 🔥', value: analytics.hot_leads, color: SCORE_COLORS.HOT },
    { name: 'WARM 🌤️', value: analytics.warm_leads, color: SCORE_COLORS.WARM },
    { name: 'COLD ❄️', value: analytics.cold_leads, color: SCORE_COLORS.COLD },
  ] : [];

  const statusCounts = leads.reduce((acc: Record<string, number>, l) => {
    const s = l.status ? l.status.toUpperCase() : 'NEW';
    acc[s] = (acc[s] || 0) + 1; 
    return acc;
  }, { NEW: 0, CONTACTED: 0, CONVERTED: 0, CLOSED: 0 });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || '#e11d48' }));

  const interestCounts = leads.reduce((acc: Record<string, number>, l) => {
    if (l.interest) { acc[l.interest] = (acc[l.interest] || 0) + 1; } return acc;
  }, {});
  const interestData = Object.entries(interestCounts).map(([name, value]) => ({ name, value }));

  const budgetCounts = leads.reduce((acc: Record<string, number>, l) => {
    if (l.budget) { acc[l.budget] = (acc[l.budget] || 0) + 1; } return acc;
  }, {});
  const budgetData = Object.entries(budgetCounts).map(([name, value]) => ({ name, value }));

  const recentLeads = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 7);

  // Daily volume chart
  const dailyCounts = leads.reduce((acc: Record<string, number>, l) => {
    const d = new Date(l.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    acc[d] = (acc[d] || 0) + 1; return acc;
  }, {});
  const dailyData = Object.entries(dailyCounts).slice(-14).map(([date, count]) => ({ date, count }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{payload[0].name}: </span>
          <span style={{ color: payload[0].fill || 'var(--accent-light)' }}>{payload[0].value}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard label="Total Leads" value={loadingAnalytics ? '—' : analytics?.total_leads ?? 0} icon={<Users size={20} color="var(--accent-light)" />} colorClass="total" />
        <StatCard label="Hot Leads 🔥" value={loadingAnalytics ? '—' : analytics?.hot_leads ?? 0} icon={<Flame size={20} color="#ef4444" />} colorClass="hot" />
        <StatCard label="Warm Leads 🌤️" value={loadingAnalytics ? '—' : analytics?.warm_leads ?? 0} icon={<Thermometer size={20} color="#f59e0b" />} colorClass="warm" />
        <StatCard label="Cold Leads ❄️" value={loadingAnalytics ? '—' : analytics?.cold_leads ?? 0} icon={<Snowflake size={20} color="#3b82f6" />} colorClass="cold" />
        <StatCard label="Conversion Rate" value={loadingAnalytics ? '—' : `${analytics?.conversion_rate?.toFixed(1) ?? 0}`} suffix="%" icon={<TrendingUp size={20} color="#22c55e" />} colorClass="conversion" />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        {/* Score Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Score Distribution</div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <PieChart>
                  <Pie data={scoreData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {scoreData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lead Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Status Breakdown</div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <BarChart data={statusData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(225,29,72,0.06)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Volume Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Lead Volume (Last 14 Days)</div>
        </div>
        <div className="card-body">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#e11d48" strokeWidth={2} fill="url(#colorLeads)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interest + Budget Row */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Interest Areas</div></div>
          <div className="card-body">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <BarChart data={interestData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(225,29,72,0.06)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Leads">
                    {interestData.map((entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Budget Segments</div></div>
          <div className="card-body">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <BarChart data={budgetData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(225,29,72,0.06)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Leads">
                    {budgetData.map((entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><AlertCircle size={16} style={{ color: 'var(--accent)' }} /> Recent Leads</div>
          <Link href="/leads" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent-light)' }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingLeads ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton skeleton-row" style={{ width: '80%', height: 16 }} /></td>
                    ))}
                  </tr>
                ))
              ) : recentLeads.map(lead => (
                <tr key={lead.id} onClick={() => window.location.href = `/leads/${lead.id}`}>
                  <td className="bold">
                    <div>{lead.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.interest || '—'}</td>
                  <td>{lead.budget || '—'}</td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><FollowupBar count={lead.followup_count} /></td>
                  <td className="muted">{new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
