import { and, count, desc, eq, inArray, or } from "drizzle-orm"; // Import count
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/db";
import {
  announcementRecipients,
  announcements,
  teamMembers,
  teams,
} from "~/db/schema";

export const announcementSchema = z.object({
  content: z.string().min(1).max(300),
  teamIds: z.array(z.string()), // empty array = all teams
  senderId: z.string(),
  senderRole: z.enum(["teacher", "admin", "staff"]),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

export async function createAnnouncement(input: AnnouncementInput) {
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  const { content, teamIds, senderId, senderRole } = parsed.data;
  const announcementId = nanoid();
  await db.insert(announcements).values({
    id: announcementId,
    senderId,
    content,
    createdAt: new Date(),
    type: "plain",
  });
  // If no teamIds, send to all teams the sender is a member of
  let targetTeams = teamIds;
  if (!teamIds.length) {
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
      targetTeams.map((teamId) => ({
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
    teamIds: targetTeams,
  };
}

export async function fetchAnnouncements(
  senderId: string,
  teamId?: string,
  page = 1,
  pageSize = 10,
) {
  // Join announcements -> recipients -> teams
  const where = [eq(announcements.senderId, senderId)];
  if (teamId && teamId !== "all") {
    where.push(eq(announcementRecipients.teamId, teamId));
  }
  const rows = await db
    .select({
      id: announcements.id,
      content: announcements.content,
      createdAt: announcements.createdAt,
      teamId: announcementRecipients.teamId,
      teamName: teams.name,
    })
    .from(announcements)
    .leftJoin(
      announcementRecipients,
      eq(announcementRecipients.announcementId, announcements.id),
    )
    .leftJoin(teams, eq(announcementRecipients.teamId, teams.id))
    .where(and(...where))
    .orderBy(desc(announcements.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
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
