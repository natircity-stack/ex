import { useState, useEffect, useMemo } from "react";
import { BonusRow } from "@/types";
import { BonusesDataTable } from "@/components/BonusesDataTable";
import { BonusRowForm } from "@/components/BonusRowForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Download } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import { exportToCsv } from "@/lib/utils";

type SortConfig = { key: keyof BonusRow; direction: 'asc' | 'desc' } | null;

const Bonuses = () => {
  const [data, setData] = useState<BonusRow[]>(() => {
    try {
      const savedData = localStorage.getItem("bonusesData");
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BonusRow | null>(null);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [nameFilter, setNameFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  useEffect(() => {
    try {
      localStorage.setItem("bonusesData", JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = data;
    if (dateFilter?.from) {
      const from = startOfDay(dateFilter.from);
      const to = dateFilter.to ? endOfDay(dateFilter.to) : endOfDay(dateFilter.from);
      filtered = filtered.filter(row => {
        const rowDate = new Date(row.date);
        return rowDate >= from && rowDate <= to;
      });
    }

    if (nameFilter) {
      filtered = filtered.filter(row => row.repName.toLowerCase().includes(nameFilter.toLowerCase()));
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
  }, [data, dateFilter, nameFilter, sortConfig]);

  const handleSort = (key: keyof BonusRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFormSubmit = (newRowData: Omit<BonusRow, 'id'>, id?: string) => {
    if (id) {
      setData(prevData => prevData.map(row => row.id === id ? { ...newRowData, id } : row));
      showSuccess("השורה עודכנה בהצלחה.");
    } else {
      const newRow: BonusRow = { id: new Date().toISOString() + Math.random(), ...newRowData };
      setData(prevData => [...prevData, newRow]);
      showSuccess("השורה נוספה בהצלחה.");
    }
    setSelectedRow(null);
  };

  const handleOpenAddForm = () => { setSelectedRow(null); setIsFormOpen(true); };
  const handleOpenEditForm = (id: string) => { const rowToEdit = data.find(row => row.id === id); if (rowToEdit) { setSelectedRow(rowToEdit); setIsFormOpen(true); } };
  const handleOpenDeleteDialog = (id: string) => { setRowToDelete(id); setIsConfirmDeleteDialogOpen(true); };
  const handleDeleteConfirm = () => { if (rowToDelete) { setData(prevData => prevData.filter(row => row.id !== rowToDelete)); setRowToDelete(null); } };
  const handleExport = () => { exportToCsv(processedData, "בונוסים"); };

  const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
      <p className="text-gray-500">{isFiltered ? "לא נמצאו בונוסים התואמים לסינון." : "אין נתונים להצגה."}</p>
      <p className="text-gray-400 mt-2">{isFiltered ? "נסה לשנות את טווח התאריכים או את שם הנציג." : 'לחץ על "הוספת בונוס" כדי להתחיל.'}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-right">בונוסים לנציגי הזמנות</h1>
          <DateRangeFilter date={dateFilter} setDate={setDateFilter} />
          <Input placeholder="חפש לפי שם נציג..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className="w-full sm:w-auto" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto"><Download className="ml-2 h-4 w-4" />ייצוא ל-CSV</Button>
          <Button onClick={handleOpenAddForm} className="w-full sm:w-auto"><PlusCircle className="ml-2 h-4 w-4" />הוספת בונוס</Button>
        </div>
      </header>
      
      <main className="mt-4">
        {processedData.length > 0 ? <BonusesDataTable data={processedData} onEdit={handleOpenEditForm} onDelete={handleOpenDeleteDialog} onSort={handleSort} sortConfig={sortConfig} /> : <EmptyState isFiltered={!!dateFilter?.from || !!nameFilter} />}
      </main>

      <BonusRowForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleFormSubmit} initialData={selectedRow} />
      <DeleteConfirmationDialog isOpen={isConfirmDeleteDialogOpen} onClose={() => setIsConfirmDeleteDialogOpen(false)} onConfirm={handleDeleteConfirm} />
    </div>
  );
};

export default Bonuses;