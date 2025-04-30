"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache"; // Import revalidatePath
import { headers } from "next/headers"; // Import headers
import * as z from "zod";
import { db } from "~/db";
import { teamInviteCodes, teamMembers, teams } from "~/db/schema";
import { userTable as users } from "~/db/schema"; // Assuming these schemas exist
import { auth } from "~/lib/auth"; // Import auth
import { inviteCodeSchema, joinCodeSchema } from "~/lib/validation/team"; // Import schemas
import type { TeamMember } from "~/types";

// Define a schema specifically for the client-side input (code only)
const clientJoinCodeSchema = z.object({
  code: z.string().length(6, { message: "Invite code must be 6 characters." }),
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

// Updated action to get userId from session
export async function joinTeamWithCode(
  input: z.infer<typeof clientJoinCodeSchema>,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const userId = session.user.id;

  // Validate only the code from input
  const parsed = clientJoinCodeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(", ") };
  }
  const { code } = parsed.data;

  try {
    const invite = await db.query.teamInviteCodes.findFirst({
      where: eq(teamInviteCodes.code, code),
    });

    if (!invite) return { error: "Invalid invite code" };
    if (invite.expiresAt < new Date()) return { error: "Invite code expired" };
    if (invite.uses >= invite.maxUses)
      return { error: "Invite code has reached its maximum uses" };

    // Check if user is already a member
    const alreadyMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, invite.teamId),
        eq(teamMembers.userId, userId), // Use userId from session
      ),
    });
    if (alreadyMember)
      return { error: "You are already a member of this team" };

    // Add member
    await db.insert(teamMembers).values({
      id: nanoid(),
      userId, // Use userId from session
      teamId: invite.teamId,
      role: "student", // Default role, adjust if needed
      joinedAt: new Date(),
    });

    // Increment uses
    await db
      .update(teamInviteCodes)
      .set({ uses: invite.uses + 1 })
      .where(eq(teamInviteCodes.id, invite.id));

    revalidatePath("/dashboard/team-management"); // Revalidate to update team list

    return { success: true, teamId: invite.teamId };
  } catch (error) {
    console.error("Error joining team with code:", error);
    return { error: "An unexpected error occurred while joining the team." };
  }
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
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
      ),
    });

    if (!membership) {
      return { error: "You are not a member of this team." };
    }

    // Prevent owner from leaving? Or handle ownership transfer? For now, let's allow leaving.
    // Consider adding logic here if the owner role has special constraints.

    // Delete the membership
    await db
      .delete(teamMembers)
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
      );

    // Revalidate the path to update the UI
    revalidatePath("/dashboard/team-management");

    return { success: true };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Fetch members for a specific team
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  // Optional: Add authorization check if needed
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session?.user?.id) {
  //   throw new Error("Not authenticated");
  // }
  // TODO: Add check to ensure the current user is part of the teamId or has permission

  try {
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        // Determine role based on your schema logic, using teamMembers.role
        role: teamMembers.role, // Use role from teamMembers table
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    // Ensure the role matches the TeamMember type ('admin' | 'member')
    // You might need to map database roles (e.g., 'teacher', 'student') to these specific strings
    return members.map((m) => ({
      ...m,
      name: m.name ?? "Unnamed User",
      email: m.email ?? "No Email",
      // Adjust this mapping based on actual roles in your teamMembers table
      role:
        m.role === "admin" || m.role === "teacher" || m.role === "staff"
          ? "admin"
          : "member",
    })) as TeamMember[];
  } catch (error) {
    console.error("Error fetching team members:", error);
    // Return empty array or throw error based on desired handling
    return [];
  }
}
