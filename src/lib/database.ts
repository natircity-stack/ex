import { supabase } from './supabase';
import { DataRow, BonusRow } from '@/types';

// Helper functions to convert between app types and database types
const convertWeeklyDataFromDB = (dbRow: any): DataRow => ({
  id: dbRow.id,
  startDate: dbRow.start_date,
  endDate: dbRow.end_date,
  totalUsers: dbRow.total_users,
  siteActivities: dbRow.site_activities,
  wentToBranch: dbRow.went_to_branch,
  duplicates: dbRow.duplicates,
  totalOrders: dbRow.total_orders,
  ordersShipped: dbRow.orders_shipped,
  shippedOrdersAmount: dbRow.shipped_orders_amount,
});

const convertWeeklyDataToDB = (appRow: Omit<DataRow, 'id'>): any => ({
  start_date: appRow.startDate,
  end_date: appRow.endDate,
  total_users: appRow.totalUsers,
  site_activities: appRow.siteActivities,
  went_to_branch: appRow.wentToBranch,
  duplicates: appRow.duplicates,
  total_orders: appRow.totalOrders,
  orders_shipped: appRow.ordersShipped,
  shipped_orders_amount: appRow.shippedOrdersAmount,
});

const convertBonusFromDB = (dbRow: any): BonusRow => ({
  id: dbRow.id,
  date: dbRow.date,
  repName: dbRow.rep_name,
  bonusAmount: dbRow.bonus_amount,
  notes: dbRow.notes || '',
});

const convertBonusToDB = (appRow: Omit<BonusRow, 'id'>): any => ({
  date: appRow.date,
  rep_name: appRow.repName,
  bonus_amount: appRow.bonusAmount,
  notes: appRow.notes,
});

// Weekly Data Operations
export const weeklyDataService = {
  async getAll(): Promise<DataRow[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_data')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data?.map(convertWeeklyDataFromDB) || [];
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      // Fallback to localStorage
      const savedData = localStorage.getItem("dataManagerData");
      return savedData ? JSON.parse(savedData) : [];
    }
  },

  async create(data: Omit<DataRow, 'id'>): Promise<DataRow> {
    try {
      const { data: result, error } = await supabase
        .from('weekly_data')
        .insert([convertWeeklyDataToDB(data)])
        .select()
        .single();

      if (error) throw error;
      return convertWeeklyDataFromDB(result);
    } catch (error) {
      console.error('Error creating weekly data:', error);
      throw error;
    }
  },

  async update(id: string, data: Omit<DataRow, 'id'>): Promise<DataRow> {
    try {
      const { data: result, error } = await supabase
        .from('weekly_data')
        .update({ ...convertWeeklyDataToDB(data), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertWeeklyDataFromDB(result);
    } catch (error) {
      console.error('Error updating weekly data:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('weekly_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting weekly data:', error);
      throw error;
    }
  },
};

// Bonuses Operations
export const bonusesService = {
  async getAll(): Promise<BonusRow[]> {
    try {
      const { data, error } = await supabase
        .from('bonuses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data?.map(convertBonusFromDB) || [];
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      // Fallback to localStorage
      const savedData = localStorage.getItem("bonusesData");
      return savedData ? JSON.parse(savedData) : [];
    }
  },

  async create(data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
    try {
      const { data: result, error } = await supabase
        .from('bonuses')
        .insert([convertBonusToDB(data)])
        .select()
        .single();

      if (error) throw error;
      return convertBonusFromDB(result);
    } catch (error) {
      console.error('Error creating bonus:', error);
      throw error;
    }
  },

  async update(id: string, data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
    try {
      const { data: result, error } = await supabase
        .from('bonuses')
        .update({ ...convertBonusToDB(data), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertBonusFromDB(result);
    } catch (error) {
      console.error('Error updating bonus:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bonuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bonus:', error);
      throw error;
    }
  },
};

// Database initialization
export const initializeDatabase = async () => {
  try {
    // Create weekly_data table
    const { error: weeklyError } = await supabase.rpc('create_weekly_data_table');
    if (weeklyError && !weeklyError.message.includes('already exists')) {
      console.error('Error creating weekly_data table:', weeklyError);
    }

    // Create bonuses table
    const { error: bonusError } = await supabase.rpc('create_bonuses_table');
    if (bonusError && !bonusError.message.includes('already exists')) {
      console.error('Error creating bonuses table:', bonusError);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};