"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AnnouncementCard } from "~/components/announcement-card";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  teamId: string;
  teamName: string;
  sender: {
    name: string | null;
    image?: string | null;
  };
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
}

const fetchAnnouncements = async (
  fetchUrl: string,
  teamId: string,
  pageParam = 1,
): Promise<FetchResponse> => {
  const res = await fetch(`${fetchUrl}?teamId=${teamId}&page=${pageParam}`);
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
}: AnnouncementListClientProps) {
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const queryClient = useQueryClient(); // Get query client

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
    refetch, // Use refetch on filter change
  } = useInfiniteQuery<FetchResponse, Error>({
    queryKey: ["announcements", selectedTeam], // Query key includes the filter
    queryFn: ({ pageParam }) =>
      fetchAnnouncements(fetchUrl, selectedTeam, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // initialData: { // Optionally provide initial data from props
    //   pages: [{ announcements: initialAnnouncements, hasMore: initialHasMore, nextCursor: initialHasMore ? 2 : undefined }],
    //   pageParams: [1],
    // },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch when selectedTeam changes
  useEffect(() => {
    refetch();
  }, [selectedTeam]);

  const handleFilterChange = (teamId: string) => {
    setSelectedTeam(teamId);
    // No need to manually set state, useEffect triggers refetch
  };

  const allAnnouncements =
    data?.pages.flatMap((page) => page.announcements) ?? [];

  return (
    // Wrap with QueryProvider if not done globally
    // <QueryProvider>
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-medium">Filter by team:</span>
        <Select onValueChange={handleFilterChange} value={selectedTeam}>
          <SelectTrigger className="w-[180px]">
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
      {error && (
        <p className="text-destructive">
          Error loading announcements: {error.message}
        </p>
      )}
      <ul className="space-y-4">
        {allAnnouncements.length === 0 && !isLoading && (
          <li className="text-muted-foreground text-center">
            No announcements found for this team.
          </li>
        )}
        {allAnnouncements.map((a) => (
          <AnnouncementCard key={`${a.id}-${a.teamId}`} announcement={a} />
        ))}
      </ul>
      {hasNextPage && (
        <Button
          className="mt-4"
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
      )}
      {isLoading && allAnnouncements.length === 0 && (
        <p className="text-muted-foreground text-center mt-4">Loading...</p>
      )}
    </div>
    // </QueryProvider>
  );
}
