"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { announcements } from "~/db/schema/schema"; // Assuming this is the correct path and table name
import { AnnouncementStatus } from "~/db/types";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Define a consistent return type for server actions
type ServerActionResult = Promise<{ success: string } | { error: string }>;

// Schema for editing an announcement
const EditAnnouncementFormSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required"),
  newContent: z.string().min(1, "Content cannot be empty").max(1000, "Content is too long"), // Max length example
});

export async function editAnnouncementAction(formData: FormData): ServerActionResult {
  const rawFormData = {
    announcementId: formData.get("announcementId"),
    newContent: formData.get("newContent"),
  };

  const validation = EditAnnouncementFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    console.error("Validation failed for edit:", validation.error.flatten().fieldErrors);
    return { error: "Invalid input for editing announcement. " + (validation.error.flatten().fieldErrors.newContent?.[0] ?? "") };
  }

  const { announcementId, newContent } = validation.data;

  try {
    const result = await db
      .update(announcements)
      .set({ content: newContent, updatedAt: new Date() }) // Explicitly set updatedAt
      .where(eq(announcements.id, announcementId))
      .returning({ updatedId: announcements.id }); // Check if update happened

    if (result.length === 0) {
      return { error: "Announcement not found or no changes made." };
    }

    revalidatePath("/dashboard/announcements");
    revalidatePath("/dash");
    return { success: "Announcement updated successfully." };
  } catch (error) {
    console.error("Failed to edit announcement:", error);
    return { error: "Database error: Failed to update announcement." };
  }
}

// Schema for scheduling an announcement
const ScheduleAnnouncementFormSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required"),
  newScheduledDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid date format for scheduled date.",
  }),
});

export async function scheduleAnnouncementAction(formData: FormData): ServerActionResult {
  const rawFormData = {
    announcementId: formData.get("announcementId"),
    newScheduledDate: formData.get("newScheduledDate"),
  };

  const validation = ScheduleAnnouncementFormSchema.safeParse(rawFormData);

  if (!validation.success) {
    console.error("Validation failed for schedule:", validation.error.flatten().fieldErrors);
    return { error: "Invalid input for scheduling announcement. " + (validation.error.flatten().fieldErrors.newScheduledDate?.[0] ?? "") };
  }
  
  const { announcementId, newScheduledDate } = validation.data;
  const scheduledDateObject = new Date(newScheduledDate);

  if (scheduledDateObject <= new Date()) {
    return { error: "Scheduled date must be in the future." };
  }

  try {
    const result = await db
      .update(announcements)
      .set({
        status: AnnouncementStatus.SCHEDULED,
        scheduledDate: scheduledDateObject, // relies on schema's $onUpdate for updatedAt
      })
      .where(eq(announcements.id, announcementId))
      .returning({ updatedId: announcements.id });

    if (result.length === 0) {
      return { error: "Announcement not found or no changes made." };
    }

    revalidatePath("/dashboard/announcements");
    revalidatePath("/dash");
    return { success: "Announcement scheduled." };
  } catch (error) {
    console.error("Failed to schedule announcement:", error);
    return { error: "Failed to schedule announcement." };
  }
}

export async function draftAnnouncementAction(formData: FormData): ServerActionResult {
  const announcementId = formData.get("announcementId") as string;
  if (!announcementId) {
    return { error: "Announcement ID is required." };
  }

  console.log(`Attempting to set announcement to draft: ${announcementId}`);
  try {
    await db
      .update(announcements)
      .set({ status: AnnouncementStatus.DRAFT })
      .where(eq(announcements.id, announcementId));

    revalidatePath("/dashboard/announcements");
    revalidatePath("/dash");
    return { success: "Announcement status set to draft." };
  } catch (error) {
    console.error("Failed to set announcement to draft:", error);
    return { error: "Failed to set announcement to draft." };
  }
}

export async function deleteAnnouncementAction(formData: FormData): ServerActionResult {
  const announcementId = formData.get("announcementId") as string;
  if (!announcementId) {
    return { error: "Announcement ID is required." };
  }
  console.log(`Attempting to delete announcement: ${announcementId}`);
  try {
    await db.delete(announcements).where(eq(announcements.id, announcementId));
    revalidatePath("/dashboard/announcements");
    revalidatePath("/dash");
    return { success: "Announcement deleted." };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { error: "Failed to delete announcement." };
  }
}
