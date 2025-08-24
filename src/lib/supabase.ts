import { createClient } from '@supabase/supabase-js';

// For direct PostgreSQL connection without Supabase hosted service
const supabaseUrl = import.meta.env.VITE_DATABASE_URL || 'postgresql://postgres:Pinokio590@@31.97.33.157:5432/postgres';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key';

// Create a custom client for direct PostgreSQL connection
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      weekly_data: {
        Row: {
          id: string;
          start_date: string;
          end_date: string;
          total_users: number;
          site_activities: number;
          went_to_branch: number;
          duplicates: number;
          total_orders: number;
          orders_shipped: number;
          shipped_orders_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          start_date: string;
          end_date: string;
          total_users: number;
          site_activities: number;
          went_to_branch: number;
          duplicates: number;
          total_orders: number;
          orders_shipped: number;
          shipped_orders_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_date?: string;
          end_date?: string;
          total_users?: number;
          site_activities?: number;
          went_to_branch?: number;
          duplicates?: number;
          total_orders?: number;
          orders_shipped?: number;
          shipped_orders_amount?: number;
          updated_at?: string;
        };
      };
      bonuses: {
        Row: {
          id: string;
          date: string;
          rep_name: string;
          bonus_amount: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          rep_name: string;
          bonus_amount: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          rep_name?: string;
          bonus_amount?: number;
          notes?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type WeeklyDataRow = Database['public']['Tables']['weekly_data']['Row'];
export type BonusRow = Database['public']['Tables']['bonuses']['Row'];
export type WeeklyDataInsert = Database['public']['Tables']['weekly_data']['Insert'];
export type BonusInsert = Database['public']['Tables']['bonuses']['Insert'];