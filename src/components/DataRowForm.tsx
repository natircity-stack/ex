import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect } from "react";
import { DataRow } from "@/types";

const formSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "יש לבחור תאריך התחלה." }),
    to: z.date({ required_error: "יש לבחור תאריך סיום." }),
  }),
  totalUsers: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  siteActivities: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  wentToBranch: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  duplicates: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  totalOrders: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  ordersShipped: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  shippedOrdersAmount: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
});

type DataRowFormProps = {
  onSubmit: (data: Omit<DataRow, 'id'>, id?: string) => void;
  initialData?: DataRow | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function DataRowForm({ onSubmit: onSubmitProp, initialData, isOpen, onOpenChange }: DataRowFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          dateRange: {
            from: new Date(initialData.startDate),
            to: new Date(initialData.endDate),
          },
          totalUsers: initialData.totalUsers,
          siteActivities: initialData.siteActivities,
          wentToBranch: initialData.wentToBranch,
          duplicates: initialData.duplicates,
          totalOrders: initialData.totalOrders,
          ordersShipped: initialData.ordersShipped,
          shippedOrdersAmount: initialData.shippedOrdersAmount,
        });
      } else {
        form.reset({
          dateRange: undefined,
          totalUsers: 0,
          siteActivities: 0,
          wentToBranch: 0,
          duplicates: 0,
          totalOrders: 0,
          ordersShipped: 0,
          shippedOrdersAmount: 0,
        });
      }
    }
  }, [initialData, isOpen, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { dateRange, ...rest } = values;
    onSubmitProp({
      ...rest,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    }, initialData?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{initialData ? "עריכת נתונים" : "הוספת נתונים חדשים"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>טווח תאריכים</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-end text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "dd/MM/yy")} -{" "}
                                {format(field.value.to, "dd/MM/yy")}
                              </>
                            ) : (
                              format(field.value.from, "dd/MM/yy")
                            )
                          ) : (
                            <span>בחר טווח תאריכים</span>
                          )}
                          <CalendarIcon className="mr-2 h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalUsers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סה״כ משתמשים</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteActivities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>פעילויות באתר</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wentToBranch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הלכו לסניף</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duplicates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כפולים</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalOrders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סה״כ הזמנות</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ordersShipped"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סה״כ הזמנות שיצאו</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippedOrdersAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סכום הזמנות שיצאו</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit">שמירה</Button>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">ביטול</Button>
                </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}