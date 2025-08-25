import { apiClient } from './api';
import { DataRow, BonusRow } from '@/types';

class DatabaseService {
  private useApi = false; // Force offline mode for demo

  // Weekly Data Methods
  async getAllWeeklyData(): Promise<DataRow[]> {
      const data = localStorage.getItem('weeklyData');
      return data ? JSON.parse(data).map(this.transformWeeklyDataFromStorage) : [];
  }

  async createWeeklyData(data: Omit<DataRow, 'id'>): Promise<DataRow> {
      const newRecord: DataRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllWeeklyData();
      const updated = [...existing, newRecord];
      localStorage.setItem('weeklyData', JSON.stringify(updated.map(this.transformWeeklyDataToStorage)));
      return newRecord;
  }

  async updateWeeklyData(id: string, data: Omit<DataRow, 'id'>): Promise<DataRow> {
      const existing = await this.getAllWeeklyData();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = { ...existing[index], ...data };
      existing[index] = updated;
      localStorage.setItem('weeklyData', JSON.stringify(existing.map(this.transformWeeklyDataToStorage)));
      return updated;
  }

  async deleteWeeklyData(id: string): Promise<void> {
      const existing = await this.getAllWeeklyData();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('weeklyData', JSON.stringify(filtered.map(this.transformWeeklyDataToStorage)));
      return;
  }

  // Bonus Methods
  async getAllBonuses(): Promise<BonusRow[]> {
      const data = localStorage.getItem('bonuses');
      return data ? JSON.parse(data).map(this.transformBonusFromStorage) : [];
  }

  async createBonus(data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
      const newRecord: BonusRow = {
        ...data,
        id: crypto.randomUUID(),
      };
      const existing = await this.getAllBonuses();
      const updated = [...existing, newRecord];
      localStorage.setItem('bonuses', JSON.stringify(updated.map(this.transformBonusToStorage)));
      return newRecord;
  }

  async updateBonus(id: string, data: Omit<BonusRow, 'id'>): Promise<BonusRow> {
      const existing = await this.getAllBonuses();
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Record not found');
      
      const updated = { ...existing[index], ...data };
      existing[index] = updated;
      localStorage.setItem('bonuses', JSON.stringify(existing.map(this.transformBonusToStorage)));
      return updated;
  }

  async deleteBonus(id: string): Promise<void> {
      const existing = await this.getAllBonuses();
      const filtered = existing.filter(item => item.id !== id);
      localStorage.setItem('bonuses', JSON.stringify(filtered.map(this.transformBonusToStorage)));
      return;
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