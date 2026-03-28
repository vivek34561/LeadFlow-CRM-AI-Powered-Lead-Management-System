'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/leads': 'Leads',
    '/analytics': 'Analytics',
    '/followups': 'Follow-ups',
};

export default function TopNav() {
    const pathname = usePathname();
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, []);

    const title = Object.entries(titles).find(([k]) => pathname.startsWith(k) && (k === '/' ? pathname === '/' : true))?.[1] ?? 'LeadIQ';

    return (
        <header className="topnav">
            <h1 className="topnav-title">{title}</h1>
            <span className="topnav-time">{time}</span>
            <button className="topnav-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={14} />
                Refresh
            </button>
        </header>
    );
}
