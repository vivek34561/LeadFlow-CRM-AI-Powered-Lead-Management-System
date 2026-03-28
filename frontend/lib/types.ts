export interface Lead {
    id: number;
    name: string;
    email: string;
    interest?: string;
    budget?: string;
    timeline?: string;
    intent?: string;
    source?: string;
    score: string;
    status: string;
    followup_count: number;
    score_explanation?: string;
    submitted_at: string;
    created_at: string;
    updated_at: string;
}

export interface Analytics {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    conversion_rate: number;
}

export interface LeadUpdate {
    status?: string;
    score?: string;
    followup_count?: number;
    score_explanation?: string;
}
