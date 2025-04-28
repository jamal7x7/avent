"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

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
        {announcements.map(a => (
          <Card key={a.id} className="flex flex-col gap-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{a.content}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{a.teamName || "All Teams"}</div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
            </CardFooter>
          </Card>
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
