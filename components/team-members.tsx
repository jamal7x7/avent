"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTeamMembers } from "~/app/dashboard/team-management/actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { TeamMember } from "~/types";

interface TeamMembersProps {
  selectedTeamId: string | null;
  selectedTeamName?: string; // Add optional prop for team name
}

export function TeamMembers({
  selectedTeamId,
  selectedTeamName,
}: TeamMembersProps) {
  const {
    data: members,
    isLoading,
    error,
  } = useQuery<TeamMember[], Error>({
    queryKey: ["teamMembers", selectedTeamId],
    queryFn: () => {
      if (!selectedTeamId) return Promise.resolve([]); // Return empty if no team selected
      return fetchTeamMembers(selectedTeamId);
    },
    enabled: !!selectedTeamId, // Only run query if selectedTeamId is not null
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!selectedTeamId) {
    return (
      <Card
        className="h-full shadow-sm flex items-center justify-center"
        aria-live="polite" // Announce changes when content appears
      >
        <CardContent className="text-center text-muted-foreground">
          <p className="text-lg">Select a team</p>
          <p className="text-sm text-muted-foreground">
            Choose a team from the list on the left to see its members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm" aria-live="polite">
      <CardHeader>
        <CardTitle id="team-members-heading">
          {selectedTeamName ? `${selectedTeamName} Members` : "Team Members"}
        </CardTitle>
        {/* Maybe add team name here if needed */}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div aria-busy="true" aria-live="polite" className="space-y-4">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  {" "}
                  {/* Changed key from `team-${i}` to i */}
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <output className="text-destructive">
            <p className="text-destructive">
              Error loading members: {error.message}
            </p>
          </output>
        )}
        {!isLoading && !error && members && members.length > 0 && (
          <ul className="space-y-4">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {/* Placeholder for actual avatar logic */}
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${member.email}.png`}
                      alt={member.name}
                    />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                >
                  {member.role}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && !error && members && members.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            This team doesn't have any members yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
