import { and, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { announcementRecipients, announcements } from "~/db/schema";
import { AnnouncementStatus } from "~/db/types";

// This endpoint should be called by a cron job every minute
// It will check for scheduled announcements that are due and publish them
export async function GET() {
  try {
    // Find all scheduled announcements that are due (scheduled date is in the past)
    const dueAnnouncements = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.status, AnnouncementStatus.SCHEDULED),
          lte(announcements.scheduledDate, new Date())
        )
      );

    if (dueAnnouncements.length === 0) {
      return NextResponse.json({ message: "No due announcements found" });
    }

    // Update each due announcement to published status
    const updatePromises = dueAnnouncements.map((announcement) =>
      db
        .update(announcements)
        .set({ status: AnnouncementStatus.PUBLISHED })
        .where(eq(announcements.id, announcement.id))
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Published ${dueAnnouncements.length} scheduled announcements`,
      publishedIds: dueAnnouncements.map((a) => a.id),
    });
  } catch (error) {
    console.error("Failed to process scheduled announcements:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled announcements" },
      { status: 500 }
    );
  }
}