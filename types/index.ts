// types/index.ts
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string | null; // Added mandatory abbreviation
  type: string | null;
  memberCount: number;
  image?: string;
  description?: string;
  role?: string;
  lastActivity?: string;
}

export interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  teamId: string;
  teamName: string;
  teamAbbreviation?: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  scheduledDate?: Date;
  sender: {
    id: string;
    name: string | null;
    image?: string | null;
    email: string;
  };
  isAcknowledged: boolean;
  isBookmarked: boolean;
  totalAcknowledged: number;
}

export type AnnouncementPriority = 'low' | 'medium' | 'high';
export type AnnouncementStatus = 'published' | 'scheduled' | 'draft';

// Add other types if needed
