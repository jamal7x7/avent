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
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { AnnouncementPriority } from "~/db/types"; // Import priority enum

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
  const [tabValue, setTabValue] = useState("announcements"); // Default tab
  const router = useRouter();
  const queryClient = useQueryClient(); // Get query client
  const { data: session } = useSession(); // Get session data

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refetch, // Use refetch on filter change
  } = useInfiniteQuery<FetchResponse, Error>({
    queryKey: ["announcements", selectedTeam, tabValue], // Include tabValue in queryKey
    queryFn: ({ pageParam }) => {
      const userIdFilter =
        tabValue === "my-announcements" ? session?.user?.id : undefined;
      return fetchAnnouncements(
        fetchUrl,
        selectedTeam,
        pageParam as number,
        userIdFilter
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // initialData: { // Optionally provide initial data from props
    //   pages: [{ announcements: initialAnnouncements, hasMore: initialHasMore, nextCursor: initialHasMore ? 2 : undefined }],
    //   pageParams: [1],
    // },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch when selectedTeam or tabValue (for non-scheduled tabs) changes
  useEffect(() => {
    // Only refetch if the tab is not 'scheduled', as 'scheduled' handles its own navigation/data
    if (tabValue !== "scheduled") {
      refetch();
    }
  }, [selectedTeam, tabValue, refetch]);

  const handleFilterChange = (teamId: string) => {
    setSelectedTeam(teamId);
    // No need to manually set state, useEffect triggers refetch
  };

  const allAnnouncements =
    data?.pages.flatMap((page) => page.announcements) ?? [];

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTabValue(value); // Always update tab state

    // Handle navigation for specific tabs or update URL for filter persistence
    // No longer navigating for "scheduled" tab, it will be rendered inline.
    if (value === "my-announcements") {
      // Optional: Update URL to reflect this tab, e.g., router.push("/dashboard/announcements?view=mine");
    } else if (value === "announcements") {
      // Optional: Update URL, e.g., router.push("/dashboard/announcements");
    }
    // refetch() will be called by the useEffect hook when tabValue changes (for non-scheduled tabs)
  };

  return (
    <div className="w-full">
      {/* Controls Bar: Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-0 py-3 border-b border-border">
        {/* Tabs Section */}
        {/* Using default Shadcn Tabs styling which is fairly minimalist */}
        <Tabs
          value={tabValue}
          onValueChange={handleTabChange}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-none md:inline-flex">
            <TabsTrigger value="announcements">All</TabsTrigger>
            <TabsTrigger value="my-announcements">My Announcements</TabsTrigger>
            {hasScheduledAccess && (
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

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
      <div className="px-0">
        {error && (
          <div className="my-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            <p className="font-semibold">Error loading announcements:</p>
            <p>{error.message}</p>
          </div>
        )}

        {tabValue === "scheduled" ? (
          <ScheduledAnnouncements selectedTeam={selectedTeam} />
        ) : (
          <>
            <ul className="space-y-6">
              {" "}
              {/* Increased spacing between cards */}
              {isLoading &&
                allAnnouncements.length === 0 && ( // Show simple loading text
                  <li className="text-muted-foreground text-center py-8">
                    Loading announcements...
                  </li>
                )}
              {!isLoading && allAnnouncements.length === 0 && (
                <li className="text-muted-foreground text-center py-8">
                  No announcements found for the current filter.
                </li>
              )}
              {allAnnouncements.map((a) => (
                <AnnouncementCard
                  key={`${a.id}-${a.teamId}-${tabValue}`} // Add tabValue to key for potential remount on tab switch
                  announcement={a}
                  currentUserId={session?.user?.id}
                />
              ))}
            </ul>
            {hasNextPage && (
              <div className="mt-6 text-center">
                {" "}
                {/* Centered Load More button */}
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || isLoading}
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : isLoading // This isLoading here refers to the general query loading, not just next page
                    ? "Loading..."
                    : "Load More"}
                </Button>
              </div>
            )}
            {/* Fallback loading indicator if hasNextPage is false but still loading (e.g. initial load after error) */}
            {isLoading && !hasNextPage && allAnnouncements.length === 0 && (
              <li className="text-muted-foreground text-center py-8">
                Loading announcements...
              </li>
            )}
          </>
        )}
      </div>{" "}
      {/* Closing tag for px-4 div */}
    </div>
  );
}
