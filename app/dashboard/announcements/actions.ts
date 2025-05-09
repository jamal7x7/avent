"use server";

import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm"; // Import sql
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/db";
import {
  accountTable,
  announcementRecipients,
  announcementUserStatus, // Import the new table
  announcements,
  sessionTable,
  teamInviteCodes,
  teamMembers,
  teams,
  twoFactorTable,
  userTable,
  verificationTable,
} from "~/db/schema";
import { AnnouncementPriority, AnnouncementStatus } from "~/db/types"; // Import both enums
import { generateTeamAbbreviation } from "~/lib/utils";

 const announcementSchema =  z.object({
  content: z.string().min(1).max(300),
  priority: z.nativeEnum(AnnouncementPriority),
  teamIds: z.array(z.string()).optional(), // empty array or undefined = all teams
  senderId: z.string(),
  senderRole: z.enum(["teacher", "admin", "staff"]),
  scheduleDate: z.date().optional(),
  status: z.nativeEnum(AnnouncementStatus).optional().default(AnnouncementStatus.PUBLISHED),
});


 type AnnouncementInput = z.infer<typeof announcementSchema>;

export async function createAnnouncement(input: AnnouncementInput) {
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  const { content, priority, teamIds, senderId, senderRole, scheduleDate, status } = parsed.data;
  const announcementId = nanoid();
  
  // Determine status based on scheduleDate
  const announcementStatus = scheduleDate 
    ? AnnouncementStatus.SCHEDULED 
    : status || AnnouncementStatus.PUBLISHED;

  await db.insert(announcements).values({
    id: announcementId,
    senderId,
    content,
    priority,
    createdAt: new Date(),
    type: "plain",
    scheduledDate: scheduleDate,
    status: announcementStatus,
  });
  // If no teamIds, send to all teams the sender is a member of
  let targetTeams = teamIds ?? [];
  if (!targetTeams.length) {
    const roles = ["teacher", "admin", "staff"];
    const userTeams = await db
      .select({ id: teams.id })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, senderId),
          or(...roles.map((r) => eq(teamMembers.role, r))),
        ),
      );
    targetTeams = userTeams.map((t) => t.id);
  }
  if (targetTeams.length) {
    await db.insert(announcementRecipients).values(
      targetTeams.map((teamId: string) => ({
        id: nanoid(),
        announcementId,
        teamId,
      })),
    );
  }
  return {
    id: announcementId,
    content,
    senderId,
    senderRole,
    createdAt: new Date(),
    priority,
    teamIds: targetTeams,
    scheduledDate: scheduleDate,
    status: announcementStatus,
  };
}

export async function fetchAnnouncements(
  userId: string, // For user-specific data like acknowledgements
  teamId?: string,
  page = 1,
  pageSize = 10,
  filterBySenderId?: string, // New parameter for filtering by sender
) {
  // Base query joining announcements and sender info
  let queryBuilder = db
    .select({
      id: announcements.id,
      content: announcements.content,
      createdAt: announcements.createdAt,
      priority: announcements.priority,
      status: announcements.status,
      scheduledDate: announcements.scheduledDate,
      teamId: announcementRecipients.teamId,
      teamName: teams.name,
      teamAbbreviation: teams.abbreviation, // Added team abbreviation
      sender: {
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        email: userTable.email, // Add sender email
      },
      // Select status fields, defaulting to false if no status record exists for the user
      isAcknowledged: sql<boolean>`coalesce(${announcementUserStatus.isAcknowledged}, false)`,
      isBookmarked: sql<boolean>`coalesce(${announcementUserStatus.isBookmarked}, false)`,
      totalAcknowledged: sql<number>`(SELECT COUNT(*) FROM ${announcementUserStatus} WHERE ${announcementUserStatus.announcementId} = ${announcements.id} AND ${announcementUserStatus.isAcknowledged} = true)`,
    })
    .from(announcements)
    .leftJoin(userTable, eq(announcements.senderId, userTable.id))
    .leftJoin(
      announcementRecipients,
      eq(announcementRecipients.announcementId, announcements.id),
    )
    .leftJoin(teams, eq(announcementRecipients.teamId, teams.id))
    // Left join user status based on announcementId AND userId
    .leftJoin(
      announcementUserStatus,
      and(
        eq(announcementUserStatus.announcementId, announcements.id),
        eq(announcementUserStatus.userId, userId),
      ),
    )

    .orderBy(desc(announcements.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .$dynamic(); // Make the query dynamic to add where clauses later

  const whereConditions = [];

  // Team filtering logic
  if (teamId && teamId !== "all") {
    whereConditions.push(eq(announcementRecipients.teamId, teamId));
  } else {
    // Filter by user's teams if teamId is 'all' or not provided
    const userTeamIdsQuery = db
      .selectDistinct({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    whereConditions.push(inArray(announcementRecipients.teamId, userTeamIdsQuery));
  }

  // Status filtering (published or past scheduled)
  whereConditions.push(
    or(
      eq(announcements.status, AnnouncementStatus.PUBLISHED),
      and(
        eq(announcements.status, AnnouncementStatus.SCHEDULED),
        sql`${announcements.scheduledDate} <= CURRENT_TIMESTAMP`
      )
    )! // Add non-null assertion if TypeScript complains about potential null from or/and
  );

  // Sender ID filtering
  if (filterBySenderId) {
    whereConditions.push(eq(announcements.senderId, filterBySenderId));
  }

  // Apply all conditions
  if (whereConditions.length > 0) {
    queryBuilder = queryBuilder.where(and(...whereConditions));
  }

  const rows = await queryBuilder;
  return rows.map(row => ({
    ...row,
    // Ensure teamAbbreviation is present, generate if not
    teamAbbreviation: row.teamAbbreviation || generateTeamAbbreviation(row.teamName || ""),
  }));
}

export async function fetchUserTeams(userId: string) {
  // Fetch all teams the user is a member of, regardless of role, and include member count
  const userTeamIdsQuery = db
    .selectDistinct({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  const userTeamsData = await db // Renamed 'result' to 'userTeamsData' for clarity
    .select({
      id: teams.id,
      name: teams.name,
      abbreviation: teams.abbreviation, // Added team abbreviation
      type: teams.type, // Include type as it's used in the page
      order: teams.order, // Added team order for sorting
      memberCount: count(teamMembers.id),
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(inArray(teams.id, userTeamIdsQuery)) // Filter teams the user is part of
    // Added teams.abbreviation and teams.order to groupBy
    .groupBy(teams.id, teams.name, teams.type, teams.abbreviation, teams.order)
    .orderBy(teams.order, teams.name); // Added orderBy

  return userTeamsData.map(team => ({
    ...team,
    // Ensure abbreviation is present, generate if not
    abbreviation: team.abbreviation || generateTeamAbbreviation(team.name || ""),
  }));
}

export async function toggleAnnouncementAcknowledge(announcementId: string, userId: string) {
  if (!userId || !announcementId) {
    return { error: "User ID and Announcement ID are required." };
  }
  // First, check if the user is a member of any team that received this announcement
  const isTeamMember = await db
    .select()
    .from(announcementRecipients)
    .innerJoin(teamMembers, eq(announcementRecipients.teamId, teamMembers.teamId))
    .where(
      and(
        eq(announcementRecipients.announcementId, announcementId),
        eq(teamMembers.userId, userId)
      )
    )
    .limit(1);

  // If user is not a member of any team that received this announcement, return error
  if (isTeamMember.length === 0) {
    return { error: "User not authenticated or not a member of the team." };
  }

  const existingStatus = await db
    .select()
    .from(announcementUserStatus)
    .where(
      and(
        eq(announcementUserStatus.announcementId, announcementId),
        eq(announcementUserStatus.userId, userId),
      ),
    )
    .limit(1);

  if (existingStatus.length > 0) {
    const currentAcknowledged = existingStatus[0].isAcknowledged;
    await db
      .update(announcementUserStatus)
      .set({
        isAcknowledged: !currentAcknowledged,
        acknowledgedAt: !currentAcknowledged ? new Date() : null,
      })
      .where(
        and(
          eq(announcementUserStatus.announcementId, announcementId),
          eq(announcementUserStatus.userId, userId),
        ),
      );
    return { isAcknowledged: !currentAcknowledged };
  }
    await db.insert(announcementUserStatus).values({
      id: nanoid(),
      announcementId,
      userId,
      isAcknowledged: true,
      acknowledgedAt: new Date(),
      isBookmarked: false, // Default value for new entries
    });
    return { isAcknowledged: true };
}

export async function toggleAnnouncementBookmark(announcementId: string, userId: string) {
  if (!userId || !announcementId) {
    return { error: "User ID and Announcement ID are required." };
  }
  // First, check if the user is a member of any team that received this announcement
  const isTeamMember = await db
    .select()
    .from(announcementRecipients)
    .innerJoin(teamMembers, eq(announcementRecipients.teamId, teamMembers.teamId))
    .where(
      and(
        eq(announcementRecipients.announcementId, announcementId),
        eq(teamMembers.userId, userId)
      )
    )
    .limit(1);

  // If user is not a member of any team that received this announcement, return error
  if (isTeamMember.length === 0) {
    return { error: "User not authenticated or not a member of the team." };
  }

  const existingStatus = await db
    .select()
    .from(announcementUserStatus)
    .where(
      and(
        eq(announcementUserStatus.announcementId, announcementId),
        eq(announcementUserStatus.userId, userId),
      ),
    )
    .limit(1);

  if (existingStatus.length > 0) {
    const currentBookmarked = existingStatus[0].isBookmarked;
    await db
      .update(announcementUserStatus)
      .set({
        isBookmarked: !currentBookmarked,
        bookmarkedAt: !currentBookmarked ? new Date() : null,
      })
      .where(
        and(
          eq(announcementUserStatus.announcementId, announcementId),
          eq(announcementUserStatus.userId, userId),
        ),
      );
    return { isBookmarked: !currentBookmarked };
  }
    await db.insert(announcementUserStatus).values({
      id: nanoid(),
      announcementId,
      userId,
      isBookmarked: true,
      bookmarkedAt: new Date(),
      isAcknowledged: false, // Default value for new entries
    });
    return { isBookmarked: true };
}
