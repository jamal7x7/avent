import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { db } from "~/db";
import { announcements } from "~/db/schema";
import { AnnouncementStatus } from "~/db/types";
import { auth } from "~/lib/auth";

// Define schema for update validation
const updateAnnouncementSchema = z.object({
  scheduledDate: z.string().optional(),
  status: z.nativeEnum(AnnouncementStatus).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate user role (only teachers, admins, staff can update announcements)
  const validRoles = ["teacher", "admin", "staff"];
  if (!session.user.role || !validRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Announcement ID is required" },
      { status: 400 },
    );
  }

  try {
    // Verify the announcement exists and belongs to this user
    const existingAnnouncement = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.id, id),
          eq(announcements.senderId, session.user.id),
        ),
      )
      .limit(1);

    if (existingAnnouncement.length === 0) {
      return NextResponse.json(
        {
          error:
            "Announcement not found or you don't have permission to update it",
        },
        { status: 404 },
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const validation = updateAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (validation.data.status) {
      updateData.status = validation.data.status;
    }

    if (validation.data.scheduledDate) {
      updateData.scheduledDate = new Date(validation.data.scheduledDate);
      // If updating schedule date, ensure status is SCHEDULED
      updateData.status = AnnouncementStatus.SCHEDULED;
    }

    // Update the announcement
    await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id));

    // Get the updated announcement
    const updatedAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    return NextResponse.json({
      announcement: {
        ...updatedAnnouncement[0],
        createdAt: updatedAnnouncement[0].createdAt.toISOString(),
        scheduledDate: updatedAnnouncement[0].scheduledDate?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}
