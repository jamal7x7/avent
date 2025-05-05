import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "~/db";
import { teamInviteCodes, teams } from "~/db/schema";
import { auth } from "~/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Only allow teachers, staff, or admins to view invite code history
    if (![
      "teacher",
      "admin",
      "staff",
    ].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Get all invite codes created by this user with team information
    const inviteCodes = await db.query.teamInviteCodes.findMany({
      where: (codes, { eq }) => eq(codes.createdBy, session.user.id),
      orderBy: (codes, { desc }) => [desc(codes.createdAt)],
      with: {
        team: {
          columns: {
            name: true,
          },
        },
      },
    });

    // Format the response
    const formattedCodes = inviteCodes.map((code) => ({
      id: code.id,
      code: code.code,
      teamId: code.teamId,
      teamName: code.team.name || "Unknown Team",
      expiresAt: code.expiresAt.toISOString(),
      maxUses: code.maxUses,
      uses: code.uses,
      createdAt: code.createdAt.toISOString(),
    }));

    return NextResponse.json({ inviteCodes: formattedCodes });
  } catch (error) {
    console.error("Error fetching invite code history:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite code history" },
      { status: 500 }
    );
  }
}