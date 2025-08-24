import { useMemo } from "react";
import { DataRow } from "@/types";
import { DataTable } from "@/components/DataTable";
import { DataRowForm } from "@/components/DataRowForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import { exportToCsv } from "@/lib/utils";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useState } from "react";

type SortConfig = { key: keyof DataRow; direction: 'asc' | 'desc' } | null;

const Index = () => {
  const { data, loading, create, update, delete: deleteData } = useWeeklyData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'startDate', direction: 'desc' });

  const processedData = useMemo(() => {
    let filtered = data;
    if (dateFilter?.from) {
      const from = startOfDay(dateFilter.from);
      const to = dateFilter.to ? endOfDay(dateFilter.to) : endOfDay(dateFilter.from);
      filtered = data.filter(row => {
        const rowStart = new Date(row.startDate);
        const rowEnd = new Date(row.endDate);
        return rowStart <= to && rowEnd >= from;
      });
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, dateFilter, sortConfig]);

  const handleSort = (key: keyof DataRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFormSubmit = async (newRowData: Omit<DataRow, 'id'>, id?: string) => {
    try {
    if (id) {
        await update(id, newRowData);
      showSuccess("השורה עודכנה בהצלחה.");
    } else {
        await create(newRowData);
      showSuccess("השורה נוספה בהצלחה.");
    }
    setSelectedRow(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleOpenAddForm = () => { setSelectedRow(null); setIsFormOpen(true); };
  const handleOpenEditForm = (id: string) => { const rowToEdit = data.find(row => row.id === id); if (rowToEdit) { setSelectedRow(rowToEdit); setIsFormOpen(true); } };
  const handleOpenDeleteDialog = (id: string) => { setRowToDelete(id); setIsConfirmDeleteDialogOpen(true); };
  const handleDeleteConfirm = async () => { 
    if (rowToDelete) { 
      try {
        await deleteData(rowToDelete);
        setRowToDelete(null);
        showSuccess("השורה נמחקה בהצלחה.");
      } catch (error) {
        // Error is already handled in the hook
      }
    } 
  };
  const handleExport = () => { exportToCsv(processedData, "סיכום_שבועי"); };

  const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
      <p className="text-gray-500">{isFiltered ? "לא נמצאו נתונים התואמים לסינון." : "אין נתונים להצגה."}</p>
      <p className="text-gray-400 mt-2">{isFiltered ? "נסה לשנות את טווח התאריכים." : 'לחץ על "הוספת סיכום שבועי" כדי להתחיל.'}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-right">מערכת ניהול נתונים</h1>
          <DateRangeFilter date={dateFilter} setDate={setDateFilter} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto"><Download className="ml-2 h-4 w-4" />ייצוא ל-CSV</Button>
          <Button onClick={handleOpenAddForm} className="w-full sm:w-auto"><PlusCircle className="ml-2 h-4 w-4" />הוספת סיכום שבועי</Button>
        </div>
      </header>
      
      <main className="mt-4">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : processedData.length > 0 ? (
          <DataTable data={processedData} onEdit={handleOpenEditForm} onDelete={handleOpenDeleteDialog} onSort={handleSort} sortConfig={sortConfig} />
        ) : (
          <EmptyState isFiltered={!!dateFilter?.from} />
        )}
      </main>

      <DataRowForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleFormSubmit} initialData={selectedRow} />
      <DeleteConfirmationDialog isOpen={isConfirmDeleteDialogOpen} onClose={() => setIsConfirmDeleteDialogOpen(false)} onConfirm={handleDeleteConfirm} />
    </div>
  );
};

export default Index;