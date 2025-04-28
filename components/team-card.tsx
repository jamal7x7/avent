"use client";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ClipboardCopyIcon } from "lucide-react";
import { useState } from "react";

export function TeamCard({ team }: { team: { id: string; name: string; type: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 justify-between">
        <span className="font-semibold text-lg flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2 py-1 mr-2">
            {team.type}
          </Badge>
          {team.name}
        </span>
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
            <TooltipContent>{copied ? "Copied!" : "Copy Team ID"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* Add more team actions/info here */}
    </Card>
  );
}
