import { useState, useMemo, useEffect } from 'react';
import { DataRow, BonusRow } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import { formatCurrency } from '@/lib/utils';
import { Users, ShoppingCart, Package, Wallet, Percent, Award, Info } from 'lucide-react';
import { Tooltip as ShadTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useBonusData } from "@/hooks/useBonusData";

const Statistics = () => {
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const { data: weeklyData, loading: weeklyLoading } = useWeeklyData();
  const { data: bonusesData, loading: bonusesLoading } = useBonusData();

  const loading = weeklyLoading || bonusesLoading;

  const filteredWeeklyData = useMemo(() => {
    let data = weeklyData.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (!dateFilter?.from) {
      return data;
    }
    const from = startOfDay(dateFilter.from);
    const to = dateFilter.to ? endOfDay(dateFilter.to) : endOfDay(dateFilter.from);
    return data.filter(row => {
      const rowStart = new Date(row.startDate);
      const rowEnd = new Date(row.endDate);
      return rowStart <= to && rowEnd >= from;
    });
  }, [weeklyData, dateFilter]);

  const filteredBonusesData = useMemo(() => {
    let data = bonusesData;
    if (dateFilter?.from) {
        const from = startOfDay(dateFilter.from);
        const to = dateFilter.to ? endOfDay(dateFilter.to) : endOfDay(dateFilter.from);
        data = data.filter(row => {
            const rowDate = new Date(row.date);
            return rowDate >= from && rowDate <= to;
        });
    }
    return data;
  }, [bonusesData, dateFilter]);

  const kpiData = useMemo(() => {
    const totalRevenue = filteredWeeklyData.reduce((sum, row) => sum + row.shippedOrdersAmount, 0);
    const totalShippedOrders = filteredWeeklyData.reduce((sum, row) => sum + row.ordersShipped, 0);
    const totalOrders = filteredWeeklyData.reduce((sum, row) => sum + row.totalOrders, 0);
    const averageOrderValue = totalShippedOrders > 0 ? totalRevenue / totalShippedOrders : 0;
    const conversionRate = totalOrders > 0 ? (totalShippedOrders / totalOrders) * 100 : 0;
    
    const totalBonuses = filteredBonusesData.reduce((sum, row) => sum + row.bonusAmount, 0);
    const activeReps = new Set(filteredBonusesData.map(row => row.repName)).size;

    return { totalRevenue, totalShippedOrders, averageOrderValue, conversionRate, totalBonuses, activeReps };
  }, [filteredWeeklyData, filteredBonusesData]);

  const orderPieData = useMemo(() => {
    if (filteredWeeklyData.length === 0) {
        return { data: [], conversion: 0, totalOrders: 0 };
    }
    const totalOrders = filteredWeeklyData.reduce((sum, row) => sum + row.totalOrders, 0);
    const ordersShipped = filteredWeeklyData.reduce((sum, row) => sum + row.ordersShipped, 0);
    const ordersNotShipped = totalOrders - ordersShipped;
    const conversion = totalOrders > 0 ? (ordersShipped / totalOrders) * 100 : 0;

    const data = [
        { name: `הזמנות שיצאו`, value: ordersShipped },
        { name: `הזמנות שלא יצאו`, value: ordersNotShipped },
    ];
    return { data, conversion, totalOrders };
  }, [filteredWeeklyData]);

  const bonusesByRep = useMemo(() => {
    const grouped = filteredBonusesData.reduce((acc, row) => {
      if (!acc[row.repName]) { acc[row.repName] = 0; }
      acc[row.repName] += row.bonusAmount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(grouped)
      .map(([name, totalBonus]) => ({ name, totalBonus }))
      .sort((a, b) => b.totalBonus - a.totalBonus);
  }, [filteredBonusesData]);

  const weeklyChartData = useMemo(() => {
    return filteredWeeklyData.map(row => ({
      date: new Date(row.startDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
      'הזמנות שיצאו': row.ordersShipped,
      'סכום הזמנות': row.shippedOrdersAmount,
    }));
  }, [filteredWeeklyData]);

  const PIE_COLORS = ['#82ca9d', '#ffc658'];

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-right">דשבורד ניהולי - רהיטי הסיטי</h1>
        </header>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8" dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-right">דשבורד ניהולי - רהיטי הסיטי</h1>
        <DateRangeFilter date={dateFilter} setDate={setDateFilter} />
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">סה"כ הכנסות</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">הזמנות שנסגרו</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.totalShippedOrders.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">שווי הזמנה ממוצע</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(kpiData.averageOrderValue)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">אחוז המרה</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.conversionRate.toFixed(2)}%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">סה"כ בונוסים</CardTitle><Award className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(kpiData.totalBonuses)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">נציגים פעילים</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.activeReps}</div></CardContent></Card>
      </section>

      <main className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>מגמת הזמנות וסכומים</CardTitle></CardHeader><CardContent>{weeklyChartData.length > 0 ? (<ResponsiveContainer width="100%" height={300}><LineChart data={weeklyChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" stroke="#8884d8" /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => formatCurrency(value)} /><Tooltip formatter={(value, name) => name === 'סכום הזמנות' ? formatCurrency(value as number) : value} /><Legend /><Line yAxisId="left" type="monotone" dataKey="הזמנות שיצאו" stroke="#8884d8" /><Line yAxisId="right" type="monotone" dataKey="סכום הזמנות" stroke="#82ca9d" /></LineChart></ResponsiveContainer>) : <p className="text-center text-muted-foreground">אין נתונים להצגה.</p>}</CardContent></Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>יחס הזמנות שנסגרו</CardTitle>
              <ShadTooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs text-right" dir="rtl">
                  <p className="font-bold">הסבר על המדדים:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><span className="font-semibold">הזמנות שיצאו:</span> הזמנות שהושלמו בהצלחה (הלקוח שילם והמוצר נשלח).</li>
                    <li><span className="font-semibold">הזמנות שלא יצאו:</span> הזמנות שנפתחו אך לא הושלמו (למשל: ביטול, בעיית תשלום).</li>
                  </ul>
                </TooltipContent>
              </ShadTooltip>
            </div>
            {orderPieData.totalOrders > 0 && (
              <p className="text-sm text-muted-foreground pt-1">
                אחוז סגירה: <span className="font-bold text-primary">{orderPieData.conversion.toFixed(2)}%</span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            {orderPieData.totalOrders > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={orderPieData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {orderPieData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => (value as number).toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground">אין נתונים להצגה.</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2"><CardHeader><CardTitle>סה"כ בונוסים לנציג</CardTitle></CardHeader><CardContent>{bonusesByRep.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={bonusesByRep} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(value) => formatCurrency(value)} /><YAxis type="category" dataKey="name" width={80} /><Tooltip formatter={(value) => formatCurrency(value as number)} /><Legend /><Bar dataKey="totalBonus" name="סך הכל בונוס" fill="#8884d8" /></BarChart></ResponsiveContainer>) : <p className="text-center text-muted-foreground">אין נתונים להצגה.</p>}</CardContent></Card>
      </main>
    </div>
  );
};

export default Statistics;