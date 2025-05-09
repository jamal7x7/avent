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
  DialogClose, // Added DialogClose
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input"; // Will change to Textarea
import { Textarea } from "~/components/ui/textarea"; // Added Textarea
import { Label } from "~/components/ui/label";
import { editAnnouncementAction } from "~/app/actions/announcement";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";

const EditAnnouncementDialogSchema = z.object({
  newContent: z.string().min(1, "Content cannot be empty.").max(1000, "Content is too long (max 1000 characters)."),
});

type EditAnnouncementDialogValues = z.infer<typeof EditAnnouncementDialogSchema>;

interface EditAnnouncementDialogProps {
  announcementId: string;
  currentContent: string;
  children: ReactNode; // For the trigger button/element
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export function EditAnnouncementDialog({
  announcementId,
  currentContent,
  children,
  onOpenChange,
  open,
}: EditAnnouncementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EditAnnouncementDialogValues>({
    resolver: zodResolver(EditAnnouncementDialogSchema),
    defaultValues: {
      newContent: currentContent,
    },
  });

  async function onSubmit(values: EditAnnouncementDialogValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("announcementId", announcementId);
    formData.append("newContent", values.newContent);

    const result = await editAnnouncementAction(formData);

    if ("success" in result) {
      toast.success(result.success);
      form.reset({ newContent: values.newContent }); // Update default for next open
      if (onOpenChange) onOpenChange(false); // Close dialog on success
    } else if ("error" in result) {
      toast.error(result.error);
      form.setError("newContent", { message: result.error }); // Show error on field if applicable
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>
            Make changes to your announcement content here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="newContent">Content</Label>
            <Textarea
              id="newContent"
              {...form.register("newContent")}
              placeholder="Enter announcement content"
              className="min-h-[100px]"
            />
            {form.formState.errors.newContent && (
              <p className="text-sm text-destructive">
                {form.formState.errors.newContent.message}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
