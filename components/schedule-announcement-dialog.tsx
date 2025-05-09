"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { scheduleAnnouncementAction } from "~/app/actions/announcement";
import { toast } from "sonner";
import { useState, type ReactNode, useEffect } from "react";
import { Calendar } from "~/components/ui/calendar"; // For date picking
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

const ScheduleAnnouncementDialogSchema = z.object({
  newScheduledDate: z.date({
    required_error: "A schedule date is required.",
    invalid_type_error: "That's not a valid date!",
  }).min(new Date(Date.now() + 60 * 1000), { message: "Scheduled date must be in the future." }), // Must be at least 1 minute in future
});

type ScheduleAnnouncementDialogValues = z.infer<typeof ScheduleAnnouncementDialogSchema>;

interface ScheduleAnnouncementDialogProps {
  announcementId: string;
  currentScheduledDate?: string | null; // ISO string or null
  children: ReactNode; // For the trigger button/element
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export function ScheduleAnnouncementDialog({
  announcementId,
  currentScheduledDate,
  children,
  onOpenChange,
  open,
}: ScheduleAnnouncementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultDate = currentScheduledDate ? new Date(currentScheduledDate) : undefined;
  // Ensure defaultDate is valid and in the future, otherwise, set to tomorrow.
  const getValidFutureDate = (date?: Date): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9,0,0,0); // Default to 9 AM tomorrow

    if (date && date > new Date()) {
      return date;
    }
    return tomorrow;
  };

  const form = useForm<ScheduleAnnouncementDialogValues>({
    resolver: zodResolver(ScheduleAnnouncementDialogSchema),
    defaultValues: {
      newScheduledDate: getValidFutureDate(defaultDate),
    },
  });
  
  useEffect(() => {
    // Reset form when currentScheduledDate changes and dialog is opened
    if (open) {
      form.reset({ newScheduledDate: getValidFutureDate(currentScheduledDate ? new Date(currentScheduledDate) : undefined) });
    }
  }, [open, currentScheduledDate, form]);


  async function onSubmit(values: ScheduleAnnouncementDialogValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("announcementId", announcementId);
    formData.append("newScheduledDate", values.newScheduledDate.toISOString());

    const result = await scheduleAnnouncementAction(formData);

    if ("success" in result) {
      toast.success(result.success);
      if (onOpenChange) onOpenChange(false); // Close dialog on success
    } else if ("error" in result) {
      toast.error(result.error);
      form.setError("newScheduledDate", { message: result.error });
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Announcement</DialogTitle>
          <DialogDescription>
            Select a new date and time to schedule this announcement. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="newScheduledDate">Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("newScheduledDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("newScheduledDate") ? (
                    format(form.watch("newScheduledDate"), "PPP HH:mm") // Include time
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("newScheduledDate")}
                  onSelect={(date) => {
                    const currentVal = form.watch("newScheduledDate") || new Date();
                    const newDate = date || currentVal;
                    // Preserve time if only date part changes, or set to current time if date is new
                    newDate.setHours(currentVal.getHours(), currentVal.getMinutes(), currentVal.getSeconds(), currentVal.getMilliseconds());
                    form.setValue("newScheduledDate", newDate, { shouldValidate: true });
                  }}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                />
                {/* Basic Time Picker - could be replaced with a more sophisticated one */}
                <div className="p-2 border-t border-border">
                  <Label htmlFor="time">Time (HH:mm)</Label>
                  <Input
                    type="time"
                    id="time"
                    defaultValue={format(form.watch("newScheduledDate") || new Date(), "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const currentDate = form.watch("newScheduledDate") || new Date();
                      currentDate.setHours(hours, minutes);
                      form.setValue("newScheduledDate", new Date(currentDate), { shouldValidate: true });
                    }}
                    className="w-full mt-1"
                  />
                </div>
              </PopoverContent>
            </Popover>
            {form.formState.errors.newScheduledDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.newScheduledDate.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
