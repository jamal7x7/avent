"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { Team } from "~/types";
import { TeamList } from "./team-list";
import { TeamMembers } from "./team-members";

interface YourTeamsTabContentProps {
  teams: Team[];
  hasTeams: boolean;
}

// Create a single QueryClient instance
// IMPORTANT: If you already have a QueryClientProvider higher up in your component tree (e.g., in layout.tsx),
// you might not need to create another one here. Remove this if redundant.
const queryClient = new QueryClient();

export function YourTeamsTabContent({
  teams,
  hasTeams,
}: YourTeamsTabContentProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    hasTeams ? (teams[0]?.id ?? null) : null,
  );

  // Find the selected team object to pass its name
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  if (!hasTeams) {
    return (
      <div className="text-muted-foreground text-center py-8 border border-dashed rounded-lg">
        No teams yet. Create or join a team using the tabs above.
      </div>
    );
  }

  return (
    // Wrap with QueryClientProvider if not already provided higher up
    <QueryClientProvider client={queryClient}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {" "}
        {/* Adjust height as needed */}
        {/* Left Sidebar - Team List */}
        {/* Add role="region" and aria-labelledby for accessibility */}
        <section
          className="md:col-span-1 lg:col-span-1 h-full"
          aria-describedby="team-list-heading"
          aria-labelledby="team-list-heading"
        >
          <TeamList
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeam={handleSelectTeam}
          />
        </section>
        {/* Right Content - Team Members */}
        {/* Add role="region" and aria-labelledby for accessibility */}
        <section
          className="md:col-span-2 lg:col-span-3 h-full"
          aria-labelledby="team-members-heading" // We'll add this ID in TeamMembers
        >
          <TeamMembers
            selectedTeamId={selectedTeamId}
            selectedTeamName={selectedTeam?.name}
          />
        </section>
      </div>
    </QueryClientProvider>
  );
}
