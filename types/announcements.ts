export interface AnnouncementSender {
  name: string;
  image: string; // URL or path to image
}

export interface AnnouncementAcknowledgement {
  userId: string;
  userName: string;
  userAvatar: string; // URL or path to image
}

export interface AnnouncementBookmark {
  userId: string;
  userName: string;
  userAvatar: string; // URL or path to image
}

export interface AnnouncementComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  parentId?: string;
  replies?: AnnouncementComment[];
}

// Import AnnouncementPriority from the single source of truth
import type { AnnouncementPriority } from "~/db/types";
export type { AnnouncementPriority }; // Re-export it for consumers of this file

export interface AnnouncementDetails {
  id: string;
  title?: string;
  content: string;
  createdAt: string; // ISO date string, consider using Date object if processed
  sender: AnnouncementSender;
  teamName: string; // Or teamId and fetch team details separately
  priority: AnnouncementPriority;
  allowQuestions: boolean;
  allowComments: boolean;
  acknowledgements: AnnouncementAcknowledgement[];
  bookmarks: AnnouncementBookmark[];
  comments?: AnnouncementComment[];
  // Optional fields based on common requirements:
  // teamId?: string;
  // category?: string;
  // tags?: string[];
  // attachments?: Array<{ name: string; url: string; type: string }>;
  // lastUpdatedAt?: string; // ISO date string
  // status?: "published" | "draft" | "archived";
}

// Summary type for announcement cards in a feed
export interface AnnouncementSummary
  extends Pick<
    AnnouncementDetails,
    |"id"

    | "createdAt"
    | "sender"
    | "teamName"
    | "priority"
  > {
  summary: string; // A short version of the content
  acknowledgementCount: number;
  isBookmarked?: boolean; // Specific to the current user
  isAcknowledged?: boolean; // Specific to the current user
}
