import { headers } from "next/headers";
import {
  fetchAnnouncements,
  fetchUserTeams,
} from "~/app/dashboard/announcements/actions";
import { AnnouncementListClient } from "~/components/announcement-list-client";
import type { AnnouncementPriority } from "~/db/types"; // Import the enum
import { auth } from "~/lib/auth";

export default async function AnnouncementList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const teams = await fetchUserTeams(session.user.id);
  const initialTeam = "all";
  const pageSize = 10;
  const announcementsData = await fetchAnnouncements(
    session.user.id,
    initialTeam,
    1,
    pageSize,
  );
  const announcements = announcementsData.map((a) => {
    const teamDetails = teams.find((t) => t.id === a.teamId);
    const abbreviation =
      a.teamAbbreviation ||
      teamDetails?.abbreviation ||
      (a.teamName ? a.teamName.charAt(0).toUpperCase() : "");

    return {
      ...a,
      createdAt:
        typeof a.createdAt === "string"
          ? a.createdAt
          : a.createdAt.toISOString(),
      teamId: a.teamId ?? "",
      teamName: a.teamName ?? "",
      teamAbbreviation: abbreviation,
      priority: a.priority as AnnouncementPriority, // Cast priority to enum type
      isAcknowledged: a.isAcknowledged, // Pass isAcknowledged through
      isBookmarked: a.isBookmarked, // Pass isBookmarked through
      sender: a.sender
        ? {
            id: a.sender.id,
            name: a.sender.name ?? null,
            image: a.sender.image ?? null,
            email: a.sender.email,
          }
        : { id: "", name: null, image: null, email: "" }
    };
  });
  const hasMore = announcements.length === pageSize;
  // Validate user role (only teachers, admins, staff can view scheduled announcements)
  const validRoles = ["teacher", "admin", "staff"];
  const hasScheduledAccess = !!(
    session.user.role && validRoles.includes(session.user.role)
  );

  return (
    <AnnouncementListClient
      initialAnnouncements={announcements}
      teams={teams}
      initialTeam={initialTeam}
      hasMore={hasMore}
      fetchUrl="/api/announcements"
      hasScheduledAccess={hasScheduledAccess}
    />
  );
}
