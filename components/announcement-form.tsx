"use client";
import { useState, useEffect } from "react";
import { useSession } from "~/lib/auth-client";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Checkbox } from "~/components/ui/checkbox";

export function AnnouncementForm() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]); 
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validRoles = ["teacher","admin","staff"];
  const role = (typeof session?.user?.role === 'string' && validRoles.includes(session.user.role))
    ? session.user.role as "teacher" | "admin" | "staff"
    : "teacher";

  if (!validRoles.includes(role)) return null;

  useEffect(() => {
    async function loadTeams() {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/teams");
          if (!res.ok) throw new Error("Failed to fetch teams");
          const { teams } = await res.json();
          setTeams(teams);
        } catch (e) {
          setError("Failed to load teams");
        }
      }
    }
    loadTeams();
  }, [session?.user?.id]);

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Announcement message cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          teamIds: selectedTeams, // [] means all teams
          senderId: session!.user.id,
          senderRole: role,
        }),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      setContent("");
      setSelectedTeams([]);
      toastAnnouncement("success", "Announcement sent!");
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to send announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl w-full">
      <div>
        <label htmlFor="announcement-content" className="block font-medium mb-1">
          Announcement
        </label>
        <Input
          id="announcement-content"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={300}
          placeholder="Write your announcement..."
          disabled={isSubmitting}
        />
        <div className="text-xs text-muted-foreground mt-1">Max 300 characters</div>
      </div>
      <div>
        <span className="font-medium">Send to teams:</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {teams.map(team => (
            <label key={team.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedTeams.includes(team.id)}
                onCheckedChange={() => handleTeamToggle(team.id)}
                id={`team-${team.id}`}
              />
              <span>{team.name}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">No selection = all teams</div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Announcement"}
      </Button>
    </form>
  );
}
