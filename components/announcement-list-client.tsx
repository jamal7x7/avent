"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  teamId: string;
  teamName: string;
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
    <div className="w-full max-w-xl mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-medium">Filter by team:</span>
        <select
          className="border rounded px-2 py-1"
          value={selectedTeam}
          onChange={e => handleFilterChange(e.target.value)}
        >
          <option value="all">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <ul className="space-y-4">
        {announcements.length === 0 && !isLoading && (
          <li className="text-muted-foreground">No announcements found.</li>
        )}
        {announcements.map(a => (
          <li key={a.id} className="bg-muted p-4 rounded shadow flex flex-col gap-1">
            <div className="text-sm text-muted-foreground">{a.teamName || "All Teams"}</div>
            <div className="font-medium">{a.content}</div>
            <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
          </li>
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
