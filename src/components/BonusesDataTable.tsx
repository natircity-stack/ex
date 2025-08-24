import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BonusRow } from "@/types";
import { Button } from "./ui/button";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

type SortConfig = { key: keyof BonusRow; direction: 'asc' | 'desc' } | null;

type BonusesDataTableProps = {
  data: BonusRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort: (key: keyof BonusRow) => void;
  sortConfig: SortConfig;
};

export function BonusesDataTable({ data, onEdit, onDelete, onSort, sortConfig }: BonusesDataTableProps) {
  const totalBonusAmount = data.reduce((sum, row) => sum + row.bonusAmount, 0);

  const SortableHeader = ({ sortKey, children }: { sortKey: keyof BonusRow; children: React.ReactNode }) => (
    <TableHead className="text-right text-blue-800 font-bold border-l border-blue-300 p-2">
      <Button variant="ghost" onClick={() => onSort(sortKey)} className="w-full justify-start p-0 hover:bg-blue-300/50">
        {children}
        {sortConfig?.key === sortKey && (sortConfig.direction === 'asc' ? <ArrowUp className="inline mr-2 h-4 w-4" /> : <ArrowDown className="inline mr-2 h-4 w-4" />)}
      </Button>
    </TableHead>
  );

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="bg-blue-200 hover:bg-blue-300/80">
            <SortableHeader sortKey="date">תאריך</SortableHeader>
            <SortableHeader sortKey="repName">שם נציג</SortableHeader>
            <SortableHeader sortKey="bonusAmount">סכום הבונוס</SortableHeader>
            <TableHead className="text-right text-blue-800 font-bold border-l border-blue-300">הערה</TableHead>
            <TableHead className="text-right text-blue-800 font-bold">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="border-l">{new Date(row.date).toLocaleDateString('he-IL')}</TableCell>
              <TableCell className="border-l">{row.repName}</TableCell>
              <TableCell className="border-l">{formatCurrency(row.bonusAmount)}</TableCell>
              <TableCell className="whitespace-pre-wrap border-l">{row.notes}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">פתח תפריט</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(row.id)}>עריכה</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(row.id)} className="text-red-600 focus:text-red-600">מחיקה</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-gray-100 font-bold">
          <TableRow>
            <TableCell colSpan={2} className="border-l">סה"כ</TableCell>
            <TableCell className="border-l">{formatCurrency(totalBonusAmount)}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}