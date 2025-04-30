"use client";

import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import type { Team } from "~/types";
import { Button } from "./ui/button";

interface TeamListProps {
  teams: Team[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
}

export function TeamList({
  teams,
  selectedTeamId,
  onSelectTeam,
}: TeamListProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-full p-4">
          {/* Add id for aria-labelledby */}
          <h3
            id="team-list-heading"
            className="text-lg font-semibold mb-3 px-1 sr-only"
          >
            Your Teams
          </h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <Button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-colors flex justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Added focus styles
                  selectedTeamId === team.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted",
                )}
                aria-current={selectedTeamId === team.id ? "true" : undefined} // Added aria-current
              >
                <span className="font-medium truncate">{team.name}</span>
                <span
                  className={cn(
                    "text-xs flex items-center gap-1",
                    selectedTeamId === team.id
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  <UsersIcon className="w-3 h-3" />
                  {team.memberCount}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
