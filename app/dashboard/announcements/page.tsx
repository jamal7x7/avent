import { AnnouncementForm } from "~/components/announcement-form";
import AnnouncementList from "~/components/announcement-list";
import DashboardContent from "../DashboardContent";

export default function AnnouncementsPage() {
  return (
    <DashboardContent>
      <div className="h-full w-full max-w-3xl mx-auto py-10 md:px-4 space-y-8">
        {/* <h1 className="text-2xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground mb-6">Manage and send announcements to your teams.</p> */}
        <AnnouncementForm />
        <div>
          <h2 className="text-lg font-semibold mb-2">Your Announcements</h2>
          <AnnouncementList />
        </div>
      </div>
    </DashboardContent>
  );
}
