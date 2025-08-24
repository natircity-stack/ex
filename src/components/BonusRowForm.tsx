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
import { Textarea } from "@/components/ui/textarea";
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
import { BonusRow } from "@/types";

const formSchema = z.object({
  date: z.date({ required_error: "יש לבחור תאריך." }),
  repName: z.string().min(1, "יש להזין שם נציג."),
  bonusAmount: z.coerce.number().min(0, "הערך חייב להיות חיובי."),
  notes: z.string().optional(),
});

type BonusRowFormProps = {
  onSubmit: (data: Omit<BonusRow, 'id'>, id?: string) => void;
  initialData?: BonusRow | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function BonusRowForm({ onSubmit: onSubmitProp, initialData, isOpen, onOpenChange }: BonusRowFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          date: new Date(initialData.date),
          repName: initialData.repName,
          bonusAmount: initialData.bonusAmount,
          notes: initialData.notes,
        });
      } else {
        form.reset({
          date: undefined,
          repName: "",
          bonusAmount: 0,
          notes: "",
        });
      }
    }
  }, [initialData, isOpen, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitProp({
      ...values,
      date: values.date.toISOString(),
    }, initialData?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{initialData ? "עריכת בונוס" : "הוספת בונוס חדש"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>תאריך</FormLabel>
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
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                          <CalendarIcon className="mr-2 h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם נציג</FormLabel>
                  <FormControl>
                    <Input placeholder="שם הנציג" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bonusAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סכום הבונוס</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערה</FormLabel>
                  <FormControl>
                    <Textarea placeholder="הערות..." {...field} />
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