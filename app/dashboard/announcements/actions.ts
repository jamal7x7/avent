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
import { AnnouncementPriority } from "~/db/types"; // Import priority enum from correct location

export const announcementSchema = z.object({
  content: z.string().min(1).max(300),
  priority: z.nativeEnum(AnnouncementPriority), // Add priority
  teamIds: z.array(z.string()).optional(), // empty array or undefined = all teams
  senderId: z.string(),
  senderRole: z.enum(["teacher", "admin", "staff"]),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

export async function createAnnouncement(input: AnnouncementInput) {
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  const { content, priority, teamIds, senderId, senderRole } = parsed.data; // Destructure priority
  const announcementId = nanoid();

  await db.insert(announcements).values({
    id: announcementId, // Use the generated announcementId here
    senderId,
    content,
    priority, // Add priority to insert values
    createdAt: new Date(),
    type: "plain",
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
    priority, // Return priority
    teamIds: targetTeams,
  };
}

export async function fetchAnnouncements(
  userId: string, // Add userId parameter
  teamId?: string,
  page = 1,
  pageSize = 10,
) {
  // Base query joining announcements and sender info
  let query = db
    .select({
      id: announcements.id,
      content: announcements.content,
      createdAt: announcements.createdAt,
      priority: announcements.priority,
      teamId: announcementRecipients.teamId,
      teamName: teams.name,
      sender: {
        name: userTable.name,
        image: userTable.image,
      },
      // Select status fields, defaulting to false if no status record exists for the user
      isReceived: sql<boolean>`coalesce(${announcementUserStatus.isReceived}, false)`,
      isFavorited: sql<boolean>`coalesce(${announcementUserStatus.isFavorited}, false)`,
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
    .offset((page - 1) * pageSize);

  // Apply team filtering if teamId is provided and not 'all'
  if (teamId && teamId !== "all") {
    query = query.where(eq(announcementRecipients.teamId, teamId));
  } else {
    // If no specific team or 'all' teams, filter announcements relevant to the user's teams
    const userTeamIdsQuery = db
      .selectDistinct({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));

    // Filter announcements where the recipient team is one the user belongs to,
    // OR announcements with no specific recipients (implicitly for all teams the sender belongs to? - needs clarification on logic for no recipients)
    // For now, let's assume announcements without recipients are not shown, or handle based on sender's teams if needed.
    // We only show announcements explicitly sent to teams the user is in.
    query = query.where(
      inArray(announcementRecipients.teamId, userTeamIdsQuery),
    );
  }

  const rows = await query;
  return rows;
}

export async function fetchUserTeams(userId: string) {
  // Fetch all teams the user is a member of, regardless of role, and include member count
  const userTeamIdsQuery = db
    .selectDistinct({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      type: teams.type, // Include type as it's used in the page
      memberCount: count(teamMembers.id),
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(inArray(teams.id, userTeamIdsQuery)) // Filter teams the user is part of
    .groupBy(teams.id, teams.name, teams.type); // Group by team to count members

  return result;
}
