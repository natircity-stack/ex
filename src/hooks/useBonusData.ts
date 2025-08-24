import { useState, useEffect } from 'react';
import { BonusRow } from '@/types';
import { bonusesService } from '@/lib/database';
import { showError } from '@/utils/toast';

export const useBonusData = () => {
  const [data, setData] = useState<BonusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bonusesService.getAll();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בטעינת הבונוסים';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (newData: Omit<BonusRow, 'id'>) => {
    try {
      const result = await bonusesService.create(newData);
      setData(prev => [result, ...prev]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה ביצירת הבונוס';
      showError(errorMessage);
      throw err;
    }
  };

  const updateData = async (id: string, updatedData: Omit<BonusRow, 'id'>) => {
    try {
      const result = await bonusesService.update(id, updatedData);
      setData(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון הבונוס';
      showError(errorMessage);
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      await bonusesService.delete(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה במחיקת הבונוס';
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