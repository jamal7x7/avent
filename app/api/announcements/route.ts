import { NextRequest, NextResponse } from "next/server";
import { fetchAnnouncements, fetchUserTeams } from "~/app/dashboard/announcements/actions";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ announcements: [], hasMore: false }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const data = await fetchAnnouncements(session.user.id, teamId, page, pageSize);
  return NextResponse.json({
    announcements: data.map(a => ({
      ...a,
      createdAt: typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString(),
      teamId: a.teamId ?? '',
      teamName: a.teamName ?? '',
    })),
    hasMore: data.length === pageSize,
  });
}
