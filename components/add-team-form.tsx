"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toastAnnouncement } from "~/components/toast-announcement";
import { useSession } from "~/lib/auth-client";
import { format } from "date-fns";

const TEAM_TYPES = [
  { value: "classroom", label: "Classroom" },
  { value: "study_group", label: "Study Group" },
  { value: "club", label: "Club" },
  { value: "committee", label: "Committee" },
  { value: "other", label: "Other" },
];

export function AddTeamForm({ teams, onTeamAdded }: { teams: { id: string; name: string; type: string }[]; onTeamAdded?: () => void }) {
  const { data: session } = useSession();
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState("classroom");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState(10);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = ["teacher", "admin", "staff"].includes(session?.user?.role ?? "");

  // Handler to create a new team (server action or API call)
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, type: teamType }),
      });
      if (!res.ok) throw new Error("Failed to create team");
      setTeamName("");
      setTeamType("classroom");
      if (onTeamAdded) onTeamAdded();
      toastAnnouncement(
        "success",
        `Team created: ${teamName} (${TEAM_TYPES.find(t => t.value === teamType)?.label || teamType})`
      );
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to create team.");
    }
  };

  // Handler to generate invite code for selected team
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    try {
      if (!selectedTeamId) {
        setError("Select a team to generate code for");
        setIsGenerating(false);
        return;
      }
      if (!expiresAt) {
        setError("Expiration date is required");
        setIsGenerating(false);
        return;
      }
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeamId,
          expiresAt: new Date(expiresAt).toISOString(),
          maxUses
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setInviteCode(data.code.code);
      toastAnnouncement("success", "Invite code generated!");
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to generate code.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isTeacher) return null;

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreateTeam} className="space-y-4 p-4 border rounded bg-card">
        <h2 className="text-lg font-semibold">Add Team</h2>
        <div>
          <label className="block font-medium mb-1">Team Name</label>
          <Input value={teamName} onChange={e => setTeamName(e.target.value)} maxLength={100} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Type</label>
          <select value={teamType} onChange={e => setTeamType(e.target.value)} className="border rounded px-2 py-1">
            {TEAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit">Create Team</Button>
      </form>

      <form onSubmit={handleGenerateCode} className="space-y-4 p-4 border rounded bg-card">
        <h2 className="text-lg font-semibold">Generate Invite Code</h2>
        <div>
          <label className="block font-medium mb-1">Select Team</label>
          <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="border rounded px-2 py-1">
            <option value="">-- Select --</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Expiration Date</label>
          <Input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Max Uses</label>
          <Input type="number" min={1} max={1000} value={maxUses} onChange={e => setMaxUses(Number(e.target.value))} required />
        </div>
        {inviteCode && (
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-lg font-bold">{inviteCode}</span>
            <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(inviteCode)}>Copy</Button>
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate Code"}</Button>
      </form>
    </div>
  );
}
