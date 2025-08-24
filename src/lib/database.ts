import { apiClient } from './api';
import { DataRow, BonusRow } from '@/types';

class DatabaseService {
  private useApi = apiClient.isAuthenticated();

  // Weekly Data Methods
  async getAllWeeklyData(): Promise<DataRow[]> {
    if (!this.useApi) {
      const data = localStorage.getItem('weeklyData');
      return data ? JSON.parse(data).map(this.transformWeeklyDataFromStorage) : [];
    }

    try {
      const data = await apiClient.getWeeklyData();
      return data.map(this.transformWeeklyDataFromApi);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      // Fallback to localStorage
      const data = localStorage.getItem('weeklyData');
      return data ? JSON.parse(data).map(this.transformWeeklyDataFromStorage) : [];
    }
  }

  async createWeeklyData(data: Omit<DataRow, 'id'>): Promise<DataRow> {
    if (!this.useApi) {
      const newRecord: DataRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllWeeklyData();
      const updated = [...existing, newRecord];
      localStorage.setItem('weeklyData', JSON.stringify(updated.map(this.transformWeeklyDataToStorage)));
      return newRecord;
    }

    try {
      const apiData = this.transformWeeklyDataToApi(data);
      const result = await apiClient.createWeeklyData(apiData);
      return this.transformWeeklyDataFromApi(result);
    } catch (error) {
      console.error('Error creating weekly data:', error);
      // Fallback to localStorage
      const newRecord: DataRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllWeeklyData();
      const updated = [...existing, newRecord];
      localStorage.setItem('weeklyData', JSON.stringify(updated.map(this.transformWeeklyDataToStorage)));
      return newRecord;
    }
  }

  async updateWeeklyData(id: string, data: Omit<DataRow, 'id'>): Promise<DataRow> {
    if (!this.useApi) {
      const existing = await this.getAllWeeklyData();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = { ...existing[index], ...data };
      existing[index] = updated;
      localStorage.setItem('weeklyData', JSON.stringify(existing.map(this.transformWeeklyDataToStorage)));
      return updated;
    }

    try {
      const apiData = this.transformWeeklyDataToApi(data);
      const result = await apiClient.updateWeeklyData(id, apiData);
      return this.transformWeeklyDataFromApi(result);
    } catch (error) {
      console.error('Error updating weekly data:', error);
      throw error;
    }
  }

  async deleteWeeklyData(id: string): Promise<void> {
    if (!this.useApi) {
      const existing = await this.getAllWeeklyData();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('weeklyData', JSON.stringify(filtered.map(this.transformWeeklyDataToStorage)));
      return;
    }

    try {
      await apiClient.deleteWeeklyData(id);
    } catch (error) {
      console.error('Error deleting weekly data:', error);
      throw error;
    }
  }

  // Bonus Methods
  async getAllBonuses(): Promise<BonusRow[]> {
    if (!this.useApi) {
      const data = localStorage.getItem('bonuses');
      return data ? JSON.parse(data).map(this.transformBonusFromStorage) : [];
    }

    try {
      const data = await apiClient.getBonuses();
      return data.map(this.transformBonusFromApi);
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      // Fallback to localStorage
      const data = localStorage.getItem('bonuses');
      return data ? JSON.parse(data).map(this.transformBonusFromStorage) : [];
    }
  }

  async createBonus(data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
    if (!this.useApi) {
      const newRecord: BonusRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllBonuses();
      const updated = [...existing, newRecord];
      localStorage.setItem('bonuses', JSON.stringify(updated.map(this.transformBonusToStorage)));
      return newRecord;
    }

    try {
      const apiData = this.transformBonusToApi(data);
      const result = await apiClient.createBonus(apiData);
      return this.transformBonusFromApi(result);
    } catch (error) {
      console.error('Error creating bonus:', error);
      // Fallback to localStorage
      const newRecord: BonusRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllBonuses();
      const updated = [...existing, newRecord];
      localStorage.setItem('bonuses', JSON.stringify(updated.map(this.transformBonusToStorage)));
      return newRecord;
    }
  }

  async updateBonus(id: string, data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
    if (!this.useApi) {
      const existing = await this.getAllBonuses();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = { ...existing[index], ...data };
      existing[index] = updated;
      localStorage.setItem('bonuses', JSON.stringify(existing.map(this.transformBonusToStorage)));
      return updated;
    }

    try {
      const apiData = this.transformBonusToApi(data);
      const result = await apiClient.updateBonus(id, apiData);
      return this.transformBonusFromApi(result);
    } catch (error) {
      console.error('Error updating bonus:', error);
      throw error;
    }
  }

  async deleteBonus(id: string): Promise<void> {
    if (!this.useApi) {
      const existing = await this.getAllBonuses();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('bonuses', JSON.stringify(filtered.map(this.transformBonusToStorage)));
      return;
    }

    try {
      await apiClient.deleteBonus(id);
    } catch (error) {
      console.error('Error deleting bonus:', error);
      throw error;
    }
  }

  // Transform methods for API compatibility
  private transformWeeklyDataFromApi(apiData: any): DataRow {
    return {
      id: crypto.randomUUID(),
      startDate: apiData.start_date,
      endDate: apiData.end_date,
      totalUsers: apiData.total_users,
      siteActivities: apiData.site_activities,
      wentToBranch: apiData.went_to_branch,
      duplicates: apiData.duplicates,
      totalOrders: apiData.total_orders,
      ordersShipped: apiData.orders_shipped,
      shippedOrdersAmount: apiData.shipped_orders_amount,
    };
  }

  private transformWeeklyDataToApi(data: Omit<DataRow, 'id'>): any {
    return {
      startDate: data.startDate,
      endDate: data.endDate,
      totalUsers: data.totalUsers,
      siteActivities: data.siteActivities,
      wentToBranch: data.wentToBranch,
      duplicates: data.duplicates,
      totalOrders: data.totalOrders,
      ordersShipped: data.ordersShipped,
      shippedOrdersAmount: data.shippedOrdersAmount,
    };
  }

  private transformWeeklyDataFromStorage(storageData: any): DataRow {
    return storageData;
  }

  private transformWeeklyDataToStorage(data: DataRow): any {
    return data;
  }

  private transformBonusFromApi(apiData: any): BonusRow {
    return {
      id: apiData.id,
      date: apiData.date,
      repName: apiData.rep_name,
      bonusAmount: apiData.bonus_amount,
      notes: apiData.notes,
    };
  }

  private transformBonusToApi(data: Omit<BonusRow, 'id'>): any {
    return {
      date: data.date,
      repName: data.repName,
      bonusAmount: data.bonusAmount,
      notes: data.notes,
    };
  }

  private transformBonusFromStorage(storageData: any): BonusRow {
    return storageData;
  }

  private transformBonusToStorage(data: BonusRow): any {
    return data;
  }
}

export const databaseService = new DatabaseService();

// Weekly Data Service
export const weeklyDataService = {
  getAll: () => databaseService.getAllWeeklyData(),
  create: (data: Omit<DataRow, 'id'>) => 
    databaseService.createWeeklyData(data),
  update: (id: string, data: Omit<DataRow, 'id'>) => 
    databaseService.updateWeeklyData(id, data),
  delete: (id: string) => databaseService.deleteWeeklyData(id),
};

// Bonuses Service
export const bonusesService = {
  getAll: () => databaseService.getAllBonuses(),
  create: (data: Omit<BonusRow, 'id'>) => 
    databaseService.createBonus(data),
  update: (id: string, data: Omit<BonusRow, 'id'>) => 
    databaseService.updateBonus(id, data),
  delete: (id: string) => databaseService.deleteBonus(id),
};