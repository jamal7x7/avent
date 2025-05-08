import { ScheduledAnnouncements } from "~/components/scheduled-announcements";
import DashboardContent from "../../DashboardContent";

export default function ScheduledAnnouncementsPage() {
  return (
    <DashboardContent>
      <div className="h-full w-full max-w-3xl mx-auto py-10 md:px-4 space-y-8">
        <h1 className="text-2xl font-bold mb-2">Scheduled Announcements</h1>
        <p className="text-muted-foreground mb-6">
          Manage your scheduled announcements. Edit schedule times, cancel, or
          save as drafts.
        </p>
        <ScheduledAnnouncements />
      </div>
    </DashboardContent>
  );
}
