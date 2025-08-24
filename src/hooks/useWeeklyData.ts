import { useState, useEffect } from 'react';
import { DataRow } from '@/types';
import { weeklyDataService } from '@/lib/database';
import { showError } from '@/utils/toast';

export const useWeeklyData = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await weeklyDataService.getAll();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (newData: Omit<DataRow, 'id'>) => {
    try {
      const result = await weeklyDataService.create(newData);
      setData(prev => [result, ...prev]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה ביצירת הנתונים';
      showError(errorMessage);
      throw err;
    }
  };

  const updateData = async (id: string, updatedData: Omit<DataRow, 'id'>) => {
    try {
      const result = await weeklyDataService.update(id, updatedData);
      setData(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון הנתונים';
      showError(errorMessage);
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      await weeklyDataService.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה במחיקת הנתונים';
      showError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: createData,
    update: updateData,
    delete: deleteData,
  };
};