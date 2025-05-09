"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnnouncementCard } from "~/components/announcement-card";
import { ScheduledAnnouncements } from "~/components/scheduled-announcements"; // Import ScheduledAnnouncements
import { useSession } from "~/lib/auth-client"; // Added useSession import
import { Label } from "~/components/ui/label"; // Added Label import
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
// import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"; // Tabs will be replaced by tags/buttons
import type { AnnouncementPriority } from "~/db/types"; // Import priority enum
import { cn } from "~/lib/utils"; // For styling active tag

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  teamId: string;
  teamName: string;
  teamAbbreviation?: string; // Added teamAbbreviation
  priority: AnnouncementPriority; // Add priority field
  sender: {
    id: string; // <--- ADDED SENDER ID HERE
    name: string | null;
    image?: string | null;
    email: string; // Add sender email
  };
  isAcknowledged: boolean; // Add isAcknowledged
  isBookmarked: boolean; // Add isBookmarked
  totalAcknowledged: number; // <--- ADDED TOTAL ACKNOWLEDGED HERE
}

interface FetchResponse {
  announcements: Announcement[];
  nextCursor?: number; // Use cursor for pagination if API supports it, otherwise page number
  hasMore: boolean;
}

interface AnnouncementListClientProps {
  initialAnnouncements: Announcement[]; // Keep initial for SSR/first load
  teams: { id: string; name: string }[];
  initialTeam: string;
  hasMore: boolean; // Keep initial for SSR/first load
  fetchUrl: string;
  hasScheduledAccess?: boolean; // Whether user has access to scheduled announcements
}

const fetchAnnouncements = async (
  fetchUrl: string,
  teamId: string,
  pageParam = 1,
  currentUserIdForFilter?: string
): Promise<FetchResponse> => {
  let apiUrl = `${fetchUrl}?teamId=${teamId}&page=${pageParam}`;
  if (currentUserIdForFilter) {
    apiUrl += `&senderId=${currentUserIdForFilter}`;
  }
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error("Failed to fetch announcements");
  }
  // Assuming API returns { announcements: [], hasMore: boolean, nextPage: number | null }
  // Adapt based on actual API response structure
  const data = await res.json();
  return {
    announcements: data.announcements,
    hasMore: data.hasMore,
    nextCursor: data.hasMore ? pageParam + 1 : undefined,
  };
};

export function AnnouncementListClient({
  // initialAnnouncements, // No longer directly used for state
  teams,
  initialTeam,
  // hasMore: initialHasMore, // No longer directly used for state
  fetchUrl,
  hasScheduledAccess = false,
}: AnnouncementListClientProps) {
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  // const [tabValue, setTabValue] = useState("announcements"); // Replaced by activeTag
  const [activeTag, setActiveTag] = useState("all"); // Default tag
  const router = useRouter(); // Still needed for ScheduledAnnouncements' "Create" button if kept
  const queryClient = useQueryClient(); // Get query client
  const { data: session } = useSession(); // Get session data

  const filterTags = [
    { value: "all", label: "All" },
    { value: "my-announcements", label: "My Announcements" },
    ...(hasScheduledAccess ? [{ value: "scheduled", label: "Scheduled" }] : []),
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refetch, // Use refetch on filter change
  } = useInfiniteQuery<FetchResponse, Error>({
    queryKey: ["announcements", selectedTeam, activeTag], // Use activeTag in queryKey
    queryFn: ({ pageParam }) => {
      // Do not fetch using this query if 'scheduled' tag is active, as ScheduledAnnouncements handles its own fetching
      if (activeTag === "scheduled") {
        return Promise.resolve({ announcements: [], hasMore: false, nextCursor: undefined });
      }
      const userIdFilter =
        activeTag === "my-announcements" ? session?.user?.id : undefined;
      return fetchAnnouncements(
        fetchUrl,
        selectedTeam,
        pageParam as number,
        userIdFilter
      );
    },
    enabled: activeTag !== "scheduled", // Only enable this query if not on scheduled tab
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // initialData: { // Optionally provide initial data from props
    //   pages: [{ announcements: initialAnnouncements, hasMore: initialHasMore, nextCursor: initialHasMore ? 2 : undefined }],
    //   pageParams: [1],
    // },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch when selectedTeam or activeTag (for non-scheduled tags) changes
  useEffect(() => {
    if (activeTag !== "scheduled") {
      refetch();
    }
  }, [selectedTeam, activeTag, refetch]);

  const handleFilterChange = (teamId: string) => {
    setSelectedTeam(teamId);
    // No need to manually set state, useEffect triggers refetch
  };

  const allAnnouncements =
    data?.pages.flatMap((page) => page.announcements) ?? [];

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
  };

  return (
    <div className="w-full">
      {/* Controls Bar: Tags and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-4 py-3 border-b border-border">
        {/* Tags Section */}
        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag) => (
            <Button
              key={tag.value}
              variant={activeTag === tag.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleTagChange(tag.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm",
                activeTag === tag.value && "font-semibold"
              )}
            >
              {tag.label}
            </Button>
          ))}
        </div>

        {/* Filter Section - Simplified */}
        <div className="w-full md:w-auto">
          <Select onValueChange={handleFilterChange} value={selectedTeam}>
            <SelectTrigger 
              id="team-filter" 
              className="w-full md:w-[220px] text-sm"
              aria-label="Filter by team"
            >
              <span className="mr-2 text-muted-foreground">Team:</span>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Content Area */}
      <div className="px-4">
        {activeTag === "scheduled" ? (
          <ScheduledAnnouncements selectedTeam={selectedTeam} />
        ) : (
          <>
            {error && ( // Show error only for non-scheduled tabs if query is enabled
              <div className="my-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                <p className="font-semibold">Error loading announcements:</p>
                <p>{error.message}</p>
              </div>
            )}
            <ul className="space-y-6">
              {isLoading && activeTag !== "scheduled" && allAnnouncements.length === 0 && (
                <li className="text-muted-foreground text-center py-8">
                  Loading announcements...
                </li>
              )}
              {!isLoading && activeTag !== "scheduled" && allAnnouncements.length === 0 && (
                <li className="text-muted-foreground text-center py-8">
                  No announcements found for the current filter.
                </li>
              )}
              {activeTag !== "scheduled" && allAnnouncements.map((a) => (
                <AnnouncementCard
                  key={`${a.id}-${a.teamId}-${activeTag}`}
                  announcement={a}
                  currentUserId={session?.user?.id}
                />
              ))}
            </ul>
            {activeTag !== "scheduled" && hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || isLoading}
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : isLoading 
                    ? "Loading..."
                    : "Load More"}
                </Button>
              </div>
            )}
            {/* Fallback loading indicator for non-scheduled tabs */}
            {isLoading && activeTag !== "scheduled" && !hasNextPage && allAnnouncements.length === 0 && (
              <li className="text-muted-foreground text-center py-8">
                Loading announcements...
              </li>
            )}
          </>
        )}
      </div>
    </div>
  );
}
