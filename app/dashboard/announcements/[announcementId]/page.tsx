import { notFound } from "next/navigation";
import { getAnnouncementById } from "~/app/actions/get-announcement";
import type { AnnouncementDetails } from "~/types/announcements";
import { AnnouncementDetailClient } from "./announcement-detail-client";

// Fetch announcement data using server action
async function getAnnouncementDetails(
  id: string,
): Promise<AnnouncementDetails> {
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return announcement;
}

interface AnnouncementPageProps {
  params: { announcementId: string };
}

export default async function AnnouncementPage({
  params,
}: AnnouncementPageProps) {
  const awaitedParams = await params;
  const announcement = await getAnnouncementDetails(
    awaitedParams.announcementId,
  );

  return (
    <div className="container mx-auto py-8">
      <AnnouncementDetailClient announcement={announcement} />
    </div>
  );
}
