export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Profile {
  id: string;
  brand_name: string;
  full_name: string;
  short_bio: string | null;
  full_bio: string | null;
  headline: string | null;
  supporting_statement: string | null;
  email: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  call_button_label: string | null;
  whatsapp_button_label: string | null;
  call_button_visible: number;
  whatsapp_button_visible: number;
  whatsapp_preset_message: string | null;
  profile_image_url: string | null;
  profile_image_alt: string | null;
  hero_eyebrow: string | null;
  hero_primary_cta_label: string | null;
  hero_primary_cta_url: string | null;
  hero_secondary_cta_label: string | null;
  hero_secondary_cta_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  cover_image_url: string | null;
  gallery_urls: string | null;
  category: string | null;
  technologies: string | null;
  status: string;
  start_date: string | null;
  last_updated: string | null;
  live_url: string | null;
  repository_url: string | null;
  demo_url: string | null;
  featured: number;
  is_published: number;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  gallery_urls: string | null;
  post_type: string;
  category: string | null;
  tags: string | null;
  status: string;
  featured: number;
  published_at: string | null;
  updated_at: string | null;
  scheduled_at: string | null;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  related_project_id: string | null;
  related_post_ids: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  is_visible: number;
  sort_order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  category: string | null;
  message: string;
  status: string;
  submitted_at: string;
}

export interface HomepageSection {
  id: string;
  section_type: string;
  title: string | null;
  content: string | null;
  config: string | null;
  is_visible: number;
  sort_order: number;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string | null;
  milestone_date: string | null;
  category: string | null;
  image_url: string | null;
  related_project_id: string | null;
  link_url: string | null;
  sort_order: number;
}

export interface NowItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string | null;
  related_project_id: string | null;
  link_url: string | null;
  image_url: string | null;
  next_milestone: string | null;
  sort_order: number;
}

export interface ButtonConfig {
  id: string;
  label: string;
  url: string;
  style: string;
  icon: string | null;
  placement: string | null;
  is_visible: number;
  sort_order: number;
}

export interface SupportCampaign {
  id: string;
  title: string;
  slug: string;
  purpose: string | null;
  description: string | null;
  cover_image_url: string | null;
  suggested_amounts: string | null;
  target_amount: number | null;
  currency: string;
  is_enabled: number;
  provider: string | null;
  provider_config: string | null;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_name: string | null;
  file_path: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}


export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}
