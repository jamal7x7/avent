import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/db";
import { teamInviteCodes, teamMembers, teams } from "~/db/schema";

export const inviteCodeSchema = z.object({
  teamId: z.string(),
  expiresAt: z.string().datetime(), // ISO string
  maxUses: z.number().min(1).max(1000),
  userId: z.string(),
});

export const joinCodeSchema = z.object({
  code: z.string().length(6),
  userId: z.string(),
});

export async function generateInviteCode(
  input: z.infer<typeof inviteCodeSchema>,
) {
  const parsed = inviteCodeSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  const { teamId, expiresAt, maxUses, userId } = parsed.data;
  // Only allow if user is a teacher, staff, or admin of the team
  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
  });
  if (!member || !["teacher", "admin", "staff"].includes(member.role)) {
    throw new Error("Not authorized to generate invite code for this team");
  }
  // Generate unique code
  let code: string;
  let tries = 0;
  do {
    code = nanoid(6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "A");
    tries++;
    if (tries > 10) throw new Error("Failed to generate unique invite code");
  } while (
    await db.query.teamInviteCodes.findFirst({
      where: eq(teamInviteCodes.code, code),
    })
  );
  // Insert code
  await db.insert(teamInviteCodes).values({
    code,
    teamId,
    createdBy: userId,
    expiresAt: new Date(expiresAt),
    maxUses,
    uses: 0,
    createdAt: new Date(),
  });
  return { code };
}

export async function joinTeamWithCode(input: z.infer<typeof joinCodeSchema>) {
  const parsed = joinCodeSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  const { code, userId } = parsed.data;
  const invite = await db.query.teamInviteCodes.findFirst({
    where: eq(teamInviteCodes.code, code),
  });
  if (!invite) throw new Error("Invalid invite code");
  if (invite.expiresAt < new Date()) throw new Error("Invite code expired");
  if (invite.uses >= invite.maxUses)
    throw new Error("Invite code has reached its maximum uses");
  // Check if user is already a member
  const alreadyMember = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.teamId, invite.teamId),
      eq(teamMembers.userId, userId),
    ),
  });
  if (alreadyMember) throw new Error("You are already a member of this team");
  // Add member
  await db.insert(teamMembers).values({
    id: nanoid(),
    userId,
    teamId: invite.teamId,
    role: "student",
    joinedAt: new Date(),
  });
  // Increment uses
  await db
    .update(teamInviteCodes)
    .set({ uses: invite.uses + 1 })
    .where(eq(teamInviteCodes.id, invite.id));
  return { success: true, teamId: invite.teamId };
}
