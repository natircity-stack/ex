// PostgreSQL direct connection service
interface WeeklyDataRow {
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
}

interface BonusRow {
  id: string;
  date: string;
  rep_name: string;
  bonus_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// PostgreSQL connection configuration
const DB_CONFIG = {
  host: '31.97.33.157',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Pinokio590@@',
};

// Since we can't use direct PostgreSQL connection in browser,
// we'll create a simple REST API simulation using fetch to a backend
// For now, we'll use localStorage as fallback and show how to implement the backend

class DatabaseService {
  private baseUrl = '/api'; // This would be your backend API URL
  private useLocalStorage = true; // Switch to false when backend is ready

  // Weekly Data Methods
  async getAllWeeklyData(): Promise<WeeklyDataRow[]> {
    if (this.useLocalStorage) {
      const data = localStorage.getItem('weeklyData');
      return data ? JSON.parse(data) : [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/weekly-data`);
      if (!response.ok) throw new Error('Failed to fetch weekly data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      // Fallback to localStorage
      const data = localStorage.getItem('weeklyData');
      return data ? JSON.parse(data) : [];
    }
  }

  async createWeeklyData(data: Omit<WeeklyDataRow, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyDataRow> {
    const newRecord: WeeklyDataRow = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const existing = await this.getAllWeeklyData();
      const updated = [...existing, newRecord];
      localStorage.setItem('weeklyData', JSON.stringify(updated));
      return newRecord;
    }

    try {
      const response = await fetch(`${this.baseUrl}/weekly-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create weekly data');
      return await response.json();
    } catch (error) {
      console.error('Error creating weekly data:', error);
      // Fallback to localStorage
      const existing = await this.getAllWeeklyData();
      const updated = [...existing, newRecord];
      localStorage.setItem('weeklyData', JSON.stringify(updated));
      return newRecord;
    }
  }

  async updateWeeklyData(id: string, data: Partial<WeeklyDataRow>): Promise<WeeklyDataRow> {
    if (this.useLocalStorage) {
      const existing = await this.getAllWeeklyData();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = {
        ...existing[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      existing[index] = updated;
      localStorage.setItem('weeklyData', JSON.stringify(existing));
      return updated;
    }

    try {
      const response = await fetch(`${this.baseUrl}/weekly-data/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update weekly data');
      return await response.json();
    } catch (error) {
      console.error('Error updating weekly data:', error);
      throw error;
    }
  }

  async deleteWeeklyData(id: string): Promise<void> {
    if (this.useLocalStorage) {
      const existing = await this.getAllWeeklyData();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('weeklyData', JSON.stringify(filtered));
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/weekly-data/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete weekly data');
    } catch (error) {
      console.error('Error deleting weekly data:', error);
      throw error;
    }
  }

  // Bonus Methods
  async getAllBonuses(): Promise<BonusRow[]> {
    if (this.useLocalStorage) {
      const data = localStorage.getItem('bonuses');
      return data ? JSON.parse(data) : [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/bonuses`);
      if (!response.ok) throw new Error('Failed to fetch bonuses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      // Fallback to localStorage
      const data = localStorage.getItem('bonuses');
      return data ? JSON.parse(data) : [];
    }
  }

  async createBonus(data: Omit<BonusRow, 'id' | 'created_at' | 'updated_at'>): Promise<BonusRow> {
    const newRecord: BonusRow = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const existing = await this.getAllBonuses();
      const updated = [...existing, newRecord];
      localStorage.setItem('bonuses', JSON.stringify(updated));
      return newRecord;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bonuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create bonus');
      return await response.json();
    } catch (error) {
      console.error('Error creating bonus:', error);
      // Fallback to localStorage
      const existing = await this.getAllBonuses();
      const updated = [...existing, newRecord];
      localStorage.setItem('bonuses', JSON.stringify(updated));
      return newRecord;
    }
  }

  async updateBonus(id: string, data: Partial<BonusRow>): Promise<BonusRow> {
    if (this.useLocalStorage) {
      const existing = await this.getAllBonuses();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = {
        ...existing[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      existing[index] = updated;
      localStorage.setItem('bonuses', JSON.stringify(existing));
      return updated;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bonuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update bonus');
      return await response.json();
    } catch (error) {
      console.error('Error updating bonus:', error);
      throw error;
    }
  }

  async deleteBonus(id: string): Promise<void> {
    if (this.useLocalStorage) {
      const existing = await this.getAllBonuses();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('bonuses', JSON.stringify(filtered));
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bonuses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bonus');
    } catch (error) {
      console.error('Error deleting bonus:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export types
export type { WeeklyDataRow, BonusRow };

// Weekly Data Service
export const weeklyDataService = {
  getAll: () => databaseService.getAllWeeklyData(),
  create: (data: Omit<WeeklyDataRow, 'id' | 'created_at' | 'updated_at'>) => 
    databaseService.createWeeklyData(data),
  update: (id: string, data: Partial<WeeklyDataRow>) => 
    databaseService.updateWeeklyData(id, data),
  delete: (id: string) => databaseService.deleteWeeklyData(id),
};

// Bonuses Service
export const bonusesService = {
  getAll: () => databaseService.getAllBonuses(),
  create: (data: Omit<BonusRow, 'id' | 'created_at' | 'updated_at'>) => 
    databaseService.createBonus(data),
  update: (id: string, data: Partial<BonusRow>) => 
    databaseService.updateBonus(id, data),
  delete: (id: string) => databaseService.deleteBonus(id),
};