export type ScoutSummary = {
  last_run_time: string | null;
  leads_found_today: number;
  top_opportunities_count: number;
  followups_due: number;
  today_businesses_discovered: number;
  today_analyzed_total: number;
  today_high_opportunity_total: number;
  dashboard_businesses_discovered: number;
  dashboard_websites_audited: number;
  dashboard_high_opportunities: number;
  dashboard_outreach_sent: number;
};

export type ScoutLead = {
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  distance?: number | null;
  score?: number | null;
  lead_tier?: string | null;
  lane?: string | null;
  best_contact_method?: string | null;
  opportunity_signals?: string[];
  slug?: string | null;
};

export type TopOpportunitiesResponse = {
  leads: ScoutLead[];
  plan_notice?: string;
  plan?: string;
};

export type RunScoutResponse = {
  ok?: boolean;
  success?: boolean;
  job_id?: string;
  status?: string;
  progress?: number;
  poll_url?: string;
  error?: string;
  message?: string;
  user_message?: string;
};

export type ScoutJobStatusResponse = {
  id: string;
  status: "queued" | "running" | "finished" | "failed" | string;
  progress: number;
  summary: string | null;
  error: string | null;
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
};

export type ScoutIntegrationResult<T> = {
  configured: boolean;
  data: T | null;
  error: string | null;
};
