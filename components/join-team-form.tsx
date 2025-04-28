"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toastAnnouncement } from "~/components/toast-announcement";

export function JoinTeamForm({ onJoined }: { onJoined?: () => void }) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsJoining(true);
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join team");
      setCode("");
      toastAnnouncement("success", "Joined team!");
      if (onJoined) onJoined();
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to join team.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4 p-4 border rounded bg-card max-w-md w-full">
      <h2 className="text-lg font-semibold">Join Team</h2>
      <div>
        <label htmlFor="join-code" className="block font-medium mb-1">Invite Code</label>
        <Input
          id="join-code"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
          placeholder="Enter 6-character code"
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={isJoining || code.length !== 6}>
        {isJoining ? "Joining..." : "Join Team"}
      </Button>
    </form>
  );
}
