import { NextRequest, NextResponse } from "next/server";
import { fetchUserTeams } from "~/app/dashboard/announcements/actions";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { db } from "~/db";
import { teams, teamMembers } from "~/db/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(32),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ teams: [] }, { status: 401 });
  }
  const data = await fetchUserTeams(session.user.id);
  return NextResponse.json({ teams: data });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, type } = parsed.data;
  const teamId = nanoid();
  await db.insert(teams).values({
    id: teamId,
    name,
    type,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(teamMembers).values({
    id: nanoid(),
    userId: session.user.id,
    teamId,
    role: "admin",
    joinedAt: new Date(),
  });
  return NextResponse.json({ success: true, teamId });
}
