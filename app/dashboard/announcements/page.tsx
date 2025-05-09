// This page is now a Server Component
import AnnouncementList from "~/components/announcement-list";
import DashboardContent from "../DashboardContent";
import AnnouncementsPageClientWrapper from "~/components/announcements-page-client-wrapper";

// export default function AnnouncementsPage() { // Can be async if needed for RSC data fetching
export default async function AnnouncementsPage() { 
  // Any server-side data fetching for the page itself could happen here
  // For now, AnnouncementList handles its own data.

  return (
    <DashboardContent>
      {/* The client wrapper will manage client-side interactions like the dialog state */}
      <AnnouncementsPageClientWrapper>
        {/* AnnouncementList is a Server Component, passed as a child */}
        <AnnouncementList /> 
      </AnnouncementsPageClientWrapper>
    </DashboardContent>
  );
}
