import { Lead } from '@/lib/types';

const scoreMap: Record<string, { cls: string; icon: string }> = {
    HOT: { cls: 'badge-hot', icon: '🔥' },
    Hot: { cls: 'badge-hot', icon: '🔥' },
    WARM: { cls: 'badge-warm', icon: '🌤️' },
    Warm: { cls: 'badge-warm', icon: '🌤️' },
    COLD: { cls: 'badge-cold', icon: '❄️' },
    Cold: { cls: 'badge-cold', icon: '❄️' },
};

const statusMap: Record<string, string> = {
    NEW: 'badge-new', New: 'badge-new',
    CONTACTED: 'badge-contacted', Contacted: 'badge-contacted',
    CONVERTED: 'badge-converted',
    CLOSED: 'badge-closed',
    Following: 'badge-following', FOLLOWING: 'badge-following',
    Bought: 'badge-bought', BOUGHT: 'badge-bought',
    Expired: 'badge-expired', EXPIRED: 'badge-expired',
};

export function ScoreBadge({ score }: { score: string }) {
    const m = scoreMap[score] ?? { cls: 'badge-cold', icon: '?' };
    return <span className={`badge ${m.cls}`}>{m.icon} {score.toUpperCase()}</span>;
}

export function StatusBadge({ status }: { status: string }) {
    const cls = statusMap[status] ?? 'badge-new';
    return <span className={`badge ${cls}`}>{status}</span>;
}

export function FollowupBar({ count, max = 3 }: { count: number; max?: number }) {
    return (
        <div className="followup-bar">
            {Array.from({ length: max }).map((_, i) => (
                <div key={i} className={`followup-dot ${i < count ? 'filled' : 'empty'}`} />
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{count}/{max}</span>
        </div>
    );
}

export function LeadName({ lead }: { lead: Lead }) {
    return (
        <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{lead.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</div>
        </div>
    );
}
