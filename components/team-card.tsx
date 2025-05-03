"use client";
import { ClipboardCopyIcon, LogOutIcon } from "lucide-react";
import { UsersIcon } from "lucide-react"; // Import UsersIcon
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { leaveTeamAction } from "~/app/dashboard/team-management/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    type: string | null; // Type might be null based on schema/fetch
    memberCount: number;
  };
}

export function TeamCard({ team }: TeamCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg flex items-center gap-2">
            {team.type && (
              <Badge variant="outline" className="text-xs px-2 py-1 mr-1">
                {team.type}
              </Badge>
            )}
            {team.name}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <UsersIcon className="w-3.5 h-3.5" />
            {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="rounded p-1 hover:bg-muted"
                onClick={async () => {
                  await navigator.clipboard.writeText(team.id);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                aria-label="Copy Team ID"
              >
                <ClipboardCopyIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Copied!" : "Copy Team ID"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              <LogOutIcon className="w-4 h-4 mr-1" />
              Leave Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You will leave the team "
                {team.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await leaveTeamAction(team.id);
                    if (result?.error) {
                      toast.error(result.error);
                    } else {
                      toast.success(`Successfully left team "${team.name}"`);
                      // Revalidation should handle UI update
                    }
                  });
                }}
              >
                {isPending ? "Leaving..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Add more team actions/info here */}
      </div>
    </Card>
  );
}
