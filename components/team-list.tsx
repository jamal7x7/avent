"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, MoreVertical, Plus, Settings, UsersIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import type { Team } from "~/types";
import { AddTeamForm } from "./add-team-form";
import { toastAnnouncement } from "./toast-announcement";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

interface TeamListProps {
  teams: Team[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  onTeamAdded?: () => void;
  onManageTeam?: (teamId: string) => void;
}

export function TeamList({
  teams,
  selectedTeamId,
  onSelectTeam,
  onTeamAdded,
  onManageTeam,
}: TeamListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.abbreviation &&
        team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleTeamAdded = () => {
    setIsAddTeamOpen(false);
    if (onTeamAdded) {
      onTeamAdded();
    }
  };

  // Map teams to the correct type for AddTeamForm
  const mappedTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    type: team.type ?? "classroom",
  }));

  return (
    <Card className="h-full border-0 bg-transparent shadow-background/0">
      <CardContent className="p-0 h-full w-full flex flex-col">
        <div className="p-4 border-b ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Teams</h3>
            <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Create new team</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <AddTeamForm
                  teams={mappedTeams}
                  onTeamAdded={handleTeamAdded}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <div key={team.id} className="group relative">
                <div
                  onClick={() => onSelectTeam(team.id)}
                  className={cn(
                    "w-full border border-transparent cursor-pointer p-3 text-left rounded-md transition-all duration-200 flex justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedTeamId === team.id
                      ? "bg-primary/10 hover:bg-primary/20 border-primary/20 shadow-sm"
                      : "hover:border-primary/20 hover:bg-muted/50",
                  )}
                  aria-current={selectedTeamId === team.id ? "true" : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 ring-2 ring-background shrink-0">
                      <AvatarImage
                        src={
                          team.image ??
                          `https://avatar.vercel.sh/${team.abbreviation}.png`
                        }
                        alt={team.name} // Keep full name for alt text for better accessibility, or use abbreviation if preferred by user later
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {team.abbreviation}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          title={team.name}
                          className="font-medium truncate max-w-16 min-w-0"
                        >
                          {team.abbreviation}
                        </span>
                        {team.role && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
                          >
                            {team.role}
                          </Badge>
                        )}
                      </div>
                      {team.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UsersIcon className="w-3 h-3" />
                      <span>{team.memberCount}</span>
                    </div>
                    {team.lastActivity && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(team.lastActivity), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-2 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onManageTeam?.(team.id)}
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Team
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <UsersIcon className="mr-2 h-4 w-4" />
                          View Members
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            {filteredTeams.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No teams found" : "No teams available"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
