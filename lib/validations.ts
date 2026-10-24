import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  summary: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['idea', 'in_progress', 'prototype', 'live', 'paused', 'archived']),
  featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  live_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  repository_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  demo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  post_type: z.enum(['article', 'daily_gist', 'weekly_gist', 'monthly_recap', 'book_review']),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  featured: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  category: z.string().min(1, 'Category is required'),
  message: z.string().min(1, 'Message is required').max(5000),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  is_visible: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export const profileSchema = z.object({
  brand_name: z.string().min(1).max(100),
  full_name: z.string().min(1).max(100),
  short_bio: z.string().optional(),
  full_bio: z.string().optional(),
  headline: z.string().optional(),
  supporting_statement: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  whatsapp_number: z.string().optional(),
  call_button_label: z.string().optional(),
  whatsapp_button_label: z.string().optional(),
  call_button_visible: z.boolean().optional(),
  whatsapp_button_visible: z.boolean().optional(),
  whatsapp_preset_message: z.string().optional(),
  location: z.string().optional(),
});

export const buttonConfigSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Invalid URL'),
  style: z.enum(['primary', 'secondary', 'outline', 'ghost']),
  icon: z.string().optional(),
  placement: z.string().optional(),
  is_visible: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  color: z.string().optional(),
});