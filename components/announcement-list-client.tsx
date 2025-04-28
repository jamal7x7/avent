"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { AnnouncementCard } from "~/components/announcement-card"; // Import AnnouncementCard

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  teamId: string;
  teamName: string;
  sender: {
    name: string;
    image?: string;
  };
}

interface AnnouncementListClientProps {
  initialAnnouncements: Announcement[];
  teams: { id: string; name: string }[];
  initialTeam: string;
  hasMore: boolean;
  fetchUrl: string;
}

export function AnnouncementListClient({
  initialAnnouncements,
  teams,
  initialTeam,
  hasMore: initialHasMore,
  fetchUrl,
}: AnnouncementListClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (teamId: string) => {
    setSelectedTeam(teamId);
    setPage(1);
    setIsLoading(true);
    const res = await fetch(`${fetchUrl}?teamId=${teamId}&page=1`);
    const data = await res.json();
    setAnnouncements(data.announcements);
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);
    const res = await fetch(`${fetchUrl}?teamId=${selectedTeam}&page=${nextPage}`);
    const data = await res.json();
    setAnnouncements(prev => [...prev, ...data.announcements]);
    setPage(nextPage);
    setHasMore(data.hasMore);
    setIsLoading(false);
  };

  return (
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
      <ul className="space-y-4">
        {announcements.length === 0 && !isLoading && (
          <li className="text-muted-foreground text-center">No announcements found.</li>
        )}
        {announcements.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} />
        ))}
      </ul>
      {hasMore && (
        <Button
          className="mt-4"
          variant="outline"
          onClick={handleLoadMore}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
  );
}
