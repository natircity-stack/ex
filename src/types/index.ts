export interface DataRow {
  id: string;
  startDate: string;
  endDate: string;
  totalUsers: number;
  siteActivities: number;
  wentToBranch: number;
  duplicates: number;
  totalOrders: number;
  ordersShipped: number;
  shippedOrdersAmount: number;
}

export interface BonusRow {
  id: string;
  date: string;
  repName: string;
  bonusAmount: number;
  notes: string;
}