"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/db";
import { teamInviteCodes, teamMembers, teams } from "~/db/schema";
import { auth } from "~/lib/auth"; // Import auth
import { revalidatePath } from "next/cache"; // Import revalidatePath
import { headers } from "next/headers"; // Import headers
import { inviteCodeSchema, joinCodeSchema } from "~/lib/validation/team"; // Import schemas

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

export async function leaveTeamAction(teamId: string) {
  const session = await auth.api.getSession({ headers: await headers() }); // Use getSession with headers()
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const userId = session.user.id;

  try {
    // Check if the user is actually a member of this team
    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
    });

    if (!membership) {
      return { error: "You are not a member of this team." };
    }

    // Prevent owner from leaving? Or handle ownership transfer? For now, let's allow leaving.
    // Consider adding logic here if the owner role has special constraints.

    // Delete the membership
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

    // Revalidate the path to update the UI
    revalidatePath("/dashboard/team-management");

    return { success: true };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
