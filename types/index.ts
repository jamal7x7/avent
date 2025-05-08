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
  abbreviation: string; // Added mandatory abbreviation
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
  sender: {
    name: string;
    image?: string | null;
  } | null;
}

// Add other types if needed
