import { and, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { announcementRecipients, announcements, teams } from "~/db/schema";
import { AnnouncementStatus } from "~/db/types";
import { auth } from "~/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate user role (only teachers, admins, staff can view scheduled announcements)
  const validRoles = ["teacher", "admin", "staff"];
  if (!session.user.role || !validRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get all scheduled announcements created by this user
    // Only include announcements that are scheduled for the future
    const scheduledAnnouncementsData = await db
      .select({
        id: announcements.id,
        content: announcements.content,
        priority: announcements.priority,
        createdAt: announcements.createdAt,
        scheduledDate: announcements.scheduledDate,
        status: announcements.status,
        senderId: announcements.senderId,
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.senderId, session.user.id),
          eq(announcements.status, AnnouncementStatus.SCHEDULED),
          gte(announcements.scheduledDate, new Date()) // Only future scheduled announcements
        )
      )
      .orderBy(announcements.scheduledDate);

    // For each announcement, get the teams it's sent to
    const announcementsWithTeams = await Promise.all(
      scheduledAnnouncementsData.map(async (announcement) => {
        const teamData = await db
          .select({
            teamId: announcementRecipients.teamId,
            teamName: teams.name,
          })
          .from(announcementRecipients)
          .innerJoin(
            teams,
            eq(announcementRecipients.teamId, teams.id)
          )
          .where(eq(announcementRecipients.announcementId, announcement.id));

        return {
          ...announcement,
          createdAt: announcement.createdAt.toISOString(),
          scheduledDate: announcement.scheduledDate?.toISOString(),
          teamIds: teamData.map((t) => t.teamId),
          teamNames: teamData.map((t) => t.teamName),
          // senderId is already selected and will be part of ...announcement
        };
      })
    );

    return NextResponse.json({ announcements: announcementsWithTeams });
  } catch (error) {
    console.error("Failed to fetch scheduled announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled announcements" },
      { status: 500 }
    );
  }
}