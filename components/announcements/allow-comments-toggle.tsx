"use client";

import { HelpCircle } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface AllowCommentsToggleProps {
  allowComments: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function AllowCommentsToggle({
  allowComments,
  onChange,
  disabled = false,
}: AllowCommentsToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <div className="flex items-center">
          <Label className="text-base">Allow Comments</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  When enabled, students can ask questions or leave comments on
                  this announcement.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Let students ask questions or leave comments on this announcement
        </p>
      </div>
      <Switch
        checked={allowComments}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
