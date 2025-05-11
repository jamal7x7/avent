import type { AnnouncementDetails, AnnouncementPriority } from "~/types/announcements";
import { AnnouncementDetailClient } from "./announcement-detail-client";

// Mock data - replace with actual data fetching
async function getAnnouncementDetails(
  id: string,
): Promise<AnnouncementDetails | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (id === "some-id") {
    return {
      id: "some-id",
      title: "Important Q3 Update & Upcoming All-Hands Meeting",
      content: `
        <p>Hello Team,</p>
        <p>We're excited to share some significant updates regarding our Q3 performance and to announce an upcoming all-hands meeting. Please read through this announcement carefully.</p>
        <h2>Q3 Performance Highlights</h2>
        <ul>
          <li>Achieved 115% of our sales target.</li>
          <li>Successfully launched Project Phoenix.</li>
          <li>Customer satisfaction score increased by 10%.</li>
        </ul>
        <h2>Upcoming All-Hands Meeting</h2>
        <p>We will be hosting an all-hands meeting to discuss these results in detail, outline our Q4 strategy, and answer any questions you may have.</p>
        <p><strong>Date:</strong> October 28, 2023</p>
        <p><strong>Time:</strong> 10:00 AM - 11:30 AM (PST)</p>
        <p><strong>Location:</strong> Main Conference Hall / Zoom (link will be shared)</p>
        <p>Your participation is crucial, and we look forward to seeing you all there.</p>
        <p>Best regards,</p>
      `,
      createdAt: new Date().toISOString(),
      sender: {
        name: "Alice Wonderland",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      teamName: "Product Team",
      priority: "URGENT" as AnnouncementPriority,
      allowQuestions: true,
      acknowledgements: [
        {
          userId: "user1",
          userName: "Bob",
          userAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          userId: "user2",
          userName: "Charlie",
          userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
        },
      ],
      bookmarks: [
        {
          userId: "user3",
          userName: "Diana",
          userAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
        },
      ],
    };
  }
  return null;
}

interface AnnouncementPageProps {
  params: { announcementId: string };
}

export default async function AnnouncementPage({
  params,
}: AnnouncementPageProps) {
  const announcement = await getAnnouncementDetails(params.announcementId);

  if (!announcement) {
    return <div>Announcement not found.</div>;
  }

  return <AnnouncementDetailClient announcement={announcement} />;
}
