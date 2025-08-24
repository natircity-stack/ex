import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataRow } from "@/types";
import { Button } from "./ui/button";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

type SortConfig = { key: keyof DataRow; direction: 'asc' | 'desc' } | null;

type DataTableProps = {
  data: DataRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSort: (key: keyof DataRow) => void;
  sortConfig: SortConfig;
};

export function DataTable({ data, onEdit, onDelete, onSort, sortConfig }: DataTableProps) {
  const totalRows = data.length;
  const totalUsers = data.reduce((sum, row) => sum + row.totalUsers, 0);
  const siteActivities = data.reduce((sum, row) => sum + row.siteActivities, 0);
  const wentToBranch = data.reduce((sum, row) => sum + row.wentToBranch, 0);
  const duplicates = data.reduce((sum, row) => sum + row.duplicates, 0);
  const totalOrders = data.reduce((sum, row) => sum + row.totalOrders, 0);
  const ordersShipped = data.reduce((sum, row) => sum + row.ordersShipped, 0);
  const shippedOrdersAmount = data.reduce((sum, row) => sum + (row.shippedOrdersAmount || 0), 0);
  const averageConversion = totalOrders > 0 ? (ordersShipped / totalOrders) * 100 : 0;

  const SortableHeader = ({ sortKey, children }: { sortKey: keyof DataRow; children: React.ReactNode }) => (
    <TableHead className="text-right text-amber-800 font-bold border-l border-amber-300 p-2">
      <Button variant="ghost" onClick={() => onSort(sortKey)} className="w-full justify-start p-0 hover:bg-amber-300/50">
        {children}
        {sortConfig?.key === sortKey && (sortConfig.direction === 'asc' ? <ArrowUp className="inline mr-2 h-4 w-4" /> : <ArrowDown className="inline mr-2 h-4 w-4" />)}
      </Button>
    </TableHead>
  );

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="bg-amber-200 hover:bg-amber-300/80">
            <SortableHeader sortKey="startDate">טווח תאריכים</SortableHeader>
            <SortableHeader sortKey="totalUsers">סה״כ משתמשים</SortableHeader>
            <SortableHeader sortKey="siteActivities">פעילויות באתר</SortableHeader>
            <SortableHeader sortKey="wentToBranch">הלכו לסניף</SortableHeader>
            <SortableHeader sortKey="duplicates">כפולים</SortableHeader>
            <SortableHeader sortKey="totalOrders">סה״כ הזמנות</SortableHeader>
            <SortableHeader sortKey="ordersShipped">סה״כ הזמנות שיצאו</SortableHeader>
            <SortableHeader sortKey="shippedOrdersAmount">סכום הזמנות שיצאו</SortableHeader>
            <TableHead className="text-right text-amber-800 font-bold border-l border-amber-300">אחוז המרה</TableHead>
            <TableHead className="text-right text-amber-800 font-bold">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const conversionRate = row.totalOrders > 0 ? (row.ordersShipped / row.totalOrders) * 100 : 0;
            return (
              <TableRow key={row.id}>
                <TableCell className="border-l">{`${new Date(row.startDate).toLocaleDateString('he-IL')} - ${new Date(row.endDate).toLocaleDateString('he-IL')}`}</TableCell>
                <TableCell className="border-l">{row.totalUsers}</TableCell>
                <TableCell className="border-l">{row.siteActivities}</TableCell>
                <TableCell className="border-l">{row.wentToBranch}</TableCell>
                <TableCell className="border-l">{row.duplicates}</TableCell>
                <TableCell className="border-l">{row.totalOrders}</TableCell>
                <TableCell className="border-l">{row.ordersShipped}</TableCell>
                <TableCell className="border-l">{formatCurrency(row.shippedOrdersAmount)}</TableCell>
                <TableCell className="border-l">{conversionRate.toFixed(2)}%</TableCell>
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
            );
          })}
        </TableBody>
        <TableFooter className="bg-gray-100 font-bold">
          <TableRow>
            <TableCell className="border-l">סה"כ ({totalRows} שורות)</TableCell>
            <TableCell className="border-l">{totalUsers}</TableCell>
            <TableCell className="border-l">{siteActivities}</TableCell>
            <TableCell className="border-l">{wentToBranch}</TableCell>
            <TableCell className="border-l">{duplicates}</TableCell>
            <TableCell className="border-l">{totalOrders}</TableCell>
            <TableCell className="border-l">{ordersShipped}</TableCell>
            <TableCell className="border-l">{formatCurrency(shippedOrdersAmount)}</TableCell>
            <TableCell className="border-l">ממוצע: {averageConversion.toFixed(2)}%</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}