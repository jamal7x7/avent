"use client";

import Image from "next/image";
import * as React from "react";

import { RiAddLine, RiExpandUpDownLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

import type { Team } from "~/types"; // Import the main Team type

export function TeamSwitcher({
  teams,
}: {
  teams: Pick<Team, "name" | "abbreviation" | "image">[]; // Use Pick from the main Team type
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);

  if (!teams.length) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3 [&>svg]:size-auto"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam && (
                  <Image
                    src={
                      activeTeam.image ??
                      `https://avatar.vercel.sh/${activeTeam.abbreviation}.png`
                    }
                    width={36}
                    height={36}
                    alt={activeTeam.name} // Alt text can remain full name for accessibility
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium" title={activeTeam?.name}>
                  {activeTeam?.abbreviation ?? "Select a Team"}
                </span>
              </div>
              <RiExpandUpDownLine
                className="ms-auto text-muted-foreground/60"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="uppercase text-muted-foreground/60 text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.abbreviation} // Use abbreviation or ID if available and unique
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden">
                  <Image
                    src={
                      team.image ??
                      `https://avatar.vercel.sh/${team.abbreviation}.png`
                    }
                    width={36}
                    height={36}
                    alt={team.name} // Alt text can remain full name
                  />
                </div>
                <span title={team.name}>{team.abbreviation}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <RiAddLine className="opacity-60" size={16} aria-hidden="true" />
              <div className="font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
