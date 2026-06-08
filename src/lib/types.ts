export type Plan = 'starter' | 'pro' | 'agency'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  youtube_handle: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  created_at: string
}

export interface Sponsor {
  id: string
  user_id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  website: string | null
  industry: string | null
  notes: string | null
  relationship_status: 'prospect' | 'active' | 'paused' | 'churned'
  avg_deal_value: number | null
  created_at: string
}

export type DealStatus = 'pitched' | 'negotiating' | 'contracted' | 'in_production' | 'delivered' | 'paid' | 'cancelled'

export interface Deal {
  id: string
  user_id: string
  sponsor_id: string | null
  title: string
  status: DealStatus
  value: number | null
  currency: string
  platform: string | null
  content_type: string | null
  deliverable_due_at: string | null
  payment_due_at: string | null
  contracted_at: string | null
  paid_at: string | null
  brief_text: string | null
  notes: string | null
  created_at: string
  updated_at: string
  sponsors?: Sponsor
}

export interface ContentItem {
  id: string
  user_id: string
  deal_id: string | null
  title: string
  platform: string | null
  content_type: string | null
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published'
  publish_date: string | null
  notes: string | null
  created_at: string
  deals?: Deal
}

export interface MetricsSnapshot {
  id: string
  user_id: string
  platform: string
  followers: number | null
  avg_views: number | null
  avg_likes: number | null
  avg_comments: number | null
  engagement_rate: number | null
  snapshot_date: string
  created_at: string
}
