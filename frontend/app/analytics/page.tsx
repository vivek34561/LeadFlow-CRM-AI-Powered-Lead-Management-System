'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Lead, Analytics } from '@/lib/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/leads?limit=1000'),
            api.get('/analytics'),
        ]).then(([lr, ar]) => {
            setLeads(lr.data);
            setAnalytics(ar.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const count = (arr: Lead[], key: keyof Lead, val: string) =>
        arr.filter(l => (l[key] as string)?.toLowerCase() === val.toLowerCase()).length;

    const intentData = ['Urgent need', 'Ready to start soon', 'Comparing options', 'Researching'].map(intent => ({
        name: intent, count: count(leads, 'intent', intent),
        hot: leads.filter(l => l.intent?.toLowerCase() === intent.toLowerCase() && l.score.toLowerCase() === 'hot').length,
        warm: leads.filter(l => l.intent?.toLowerCase() === intent.toLowerCase() && l.score.toLowerCase() === 'warm').length,
        cold: leads.filter(l => l.intent?.toLowerCase() === intent.toLowerCase() && l.score.toLowerCase() === 'cold').length,
    }));

    const timelineData = ['Immediate', '1 month', 'Just exploring'].map(tl => ({
        name: tl, count: count(leads, 'timeline', tl),
    }));

    const budgetIntentMatrix = ['High', 'Medium', 'Low'].map(budget => ({
        budget,
        'Urgent need': leads.filter(l => l.budget === budget && l.intent === 'Urgent need').length,
        'Ready to start soon': leads.filter(l => l.budget === budget && l.intent === 'Ready to start soon').length,
        'Comparing options': leads.filter(l => l.budget === budget && l.intent === 'Comparing options').length,
        Researching: leads.filter(l => l.budget === budget && l.intent === 'Researching').length,
    }));

    const sourceData = leads.reduce((acc: Record<string, number>, l) => {
        const s = l.source || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc;
    }, {});
    const sourcePieData = Object.entries(sourceData).map(([name, value], i) => ({ name, value, color: ['#6366f1', '#f59e0b', '#22c55e', '#ef4444'][i % 4] }));

    const interestScoreData = ['AI course', 'Data Science', 'Mathematics', 'Development'].map(interest => ({
        interest,
        HOT: leads.filter(l => l.interest === interest && l.score.toLowerCase() === 'hot').length,
        WARM: leads.filter(l => l.interest === interest && l.score.toLowerCase() === 'warm').length,
        COLD: leads.filter(l => l.interest === interest && l.score.toLowerCase() === 'cold').length,
    }));

    const followupDistData = [0, 1, 2, 3].map(n => ({
        name: `${n} follow-up${n !== 1 ? 's' : ''}`,
        count: leads.filter(l => l.followup_count === n).length,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
                    {payload.map((p: any, i: number) => (
                        <div key={i} style={{ color: p.fill || p.color, display: 'flex', gap: 8 }}>
                            <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
            <RefreshCw size={32} className="spinning" />
            Crunching your data…
        </div>
    );

    return (
        <div>
            <div className="section-header" style={{ marginBottom: 24 }}>
                <div>
                    <div className="section-title">Advanced Analytics</div>
                    <div className="section-subtitle">Deep dive into your {leads.length} leads</div>
                </div>
            </div>

            {/* KPI Summary row */}
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Leads', value: analytics?.total_leads ?? 0, color: '#6366f1' },
                    { label: 'Hot Rate', value: `${analytics ? ((analytics.hot_leads / analytics.total_leads) * 100).toFixed(1) : 0}%`, color: '#ef4444' },
                    { label: 'Warm Rate', value: `${analytics ? ((analytics.warm_leads / analytics.total_leads) * 100).toFixed(1) : 0}%`, color: '#f59e0b' },
                    { label: 'Cold Rate', value: `${analytics ? ((analytics.cold_leads / analytics.total_leads) * 100).toFixed(1) : 0}%`, color: '#3b82f6' },
                    { label: 'Conversion Rate', value: `${analytics?.conversion_rate?.toFixed(1) ?? 0}%`, color: '#22c55e' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="kpi-card" style={{ borderTop: `2px solid ${color}` }}>
                        <div className="kpi-value" style={{ color }}>{value}</div>
                        <div className="kpi-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* Row 1: Intent breakdown + Source pie */}
            <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Intent vs Score Heatmap</div></div>
                    <div className="card-body">
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={intentData} barCategoryGap="20%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                                    <Bar dataKey="hot" name="HOT" stackId="a" fill="#ef4444" />
                                    <Bar dataKey="warm" name="WARM" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="cold" name="COLD" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title">Lead Sources</div></div>
                    <div className="card-body">
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sourcePieData} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value">
                                        {sourcePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Interest×Score + Timeline */}
            <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Interest Area × Score</div></div>
                    <div className="card-body">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={interestScoreData} barCategoryGap="20%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                                    <XAxis dataKey="interest" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                                    <Bar dataKey="HOT" stackId="a" fill="#ef4444" />
                                    <Bar dataKey="WARM" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="COLD" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title">Timeline Distribution</div></div>
                    <div className="card-body">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timelineData} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Bar dataKey="count" name="Leads" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Budget×Intent + Followup dist */}
            <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Budget × Intent Matrix</div></div>
                    <div className="card-body">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={budgetIntentMatrix} barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                                    <XAxis dataKey="budget" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
                                    <Bar dataKey="Urgent need" stackId="a" fill="#ef4444" />
                                    <Bar dataKey="Ready to start soon" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="Comparing options" stackId="a" fill="#6366f1" />
                                    <Bar dataKey="Researching" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title">Follow-up Count Distribution</div></div>
                    <div className="card-body">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={followupDistData} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Bar dataKey="count" name="Leads" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
