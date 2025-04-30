import { headers } from "next/headers";
import {
  fetchAnnouncements,
  fetchUserTeams,
} from "~/app/dashboard/announcements/actions";
import { AnnouncementListClient } from "~/components/announcement-list-client";
import { auth } from "~/lib/auth";

export default async function AnnouncementList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const teams = await fetchUserTeams(session.user.id);
  const initialTeam = "all";
  const pageSize = 10;
  const announcements = (
    await fetchAnnouncements(session.user.id, initialTeam, 1, pageSize)
  ).map((a) => ({
    ...a,
    createdAt:
      typeof a.createdAt === "string" ? a.createdAt : a.createdAt.toISOString(),
    teamId: a.teamId ?? "",
    teamName: a.teamName ?? "",
    priority: a.priority, // Pass priority through
    sender: a.sender
      ? {
          name: a.sender.name ?? null,
          image: a.sender.image ?? null,
        }
      : { name: null, image: null },
  }));
  const hasMore = announcements.length === pageSize;
  return (
    <AnnouncementListClient
      initialAnnouncements={announcements}
      teams={teams}
      initialTeam={initialTeam}
      hasMore={hasMore}
      fetchUrl="/api/announcements"
    />
  );
}
