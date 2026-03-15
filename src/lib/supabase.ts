import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client only if properly configured
const createSupabaseClient = (): SupabaseClient | null => {
  if (!isConfigured) {
    console.log('[Supabase] Running in demo mode (no credentials)');
    return null;
  }
  
  try {
    return createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (error) {
    console.error('[Supabase] Failed to initialize:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();
export const isSupabaseConfigured = () => isConfigured;

// Safe accessor - returns null client if not configured
export const getSupabase = (): SupabaseClient | null => supabase;

export type Database = import('../types/database.types').Database;

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type VideoAsset = Database['public']['Tables']['video_assets']['Row'];

export type SubscriptionTier = Database['public']['Enums']['subscription_tier'];
export type TestimonialStatus = Database['public']['Enums']['testimonial_status'];
export type VideoStatus = Database['public']['Enums']['video_status'];
