"use client";

import { BookmarkIcon, Check, CheckCheck, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  toggleAnnouncementAcknowledge,
  toggleAnnouncementBookmark,
} from "~/app/dashboard/announcements/actions";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface AnnouncementInteractionsProps {
  announcementId: string;
  currentUserId?: string;
  initialAcknowledgedCount?: number;
  initialIsAcknowledged?: boolean;
  initialIsBookmarked?: boolean;
}

export function AnnouncementInteractions({
  announcementId,
  currentUserId,
  initialAcknowledgedCount = 0,
  initialIsAcknowledged = false,
  initialIsBookmarked = false,
}: AnnouncementInteractionsProps) {
  const [isAcknowledged, setIsAcknowledged] = useState(initialIsAcknowledged);
  const [acknowledgedCount, setAcknowledgedCount] = useState(
    initialAcknowledgedCount,
  );
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPendingAcknowledge, startAcknowledgeTransition] = useTransition();
  const [isPendingBookmark, startBookmarkTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAcknowledge = () => {
    if (!currentUserId) {
      toast.error("Please sign in to interact with announcements.");
      return;
    }

    // Clear any previous errors
    setError(null);

    startAcknowledgeTransition(async () => {
      try {
        const result = await toggleAnnouncementAcknowledge(
          announcementId,
          currentUserId,
        );

        if (result.error) {
          setError(result.error);
          toast.error(result.error || "Failed to update acknowledgement.");
          return;
        }

        if (typeof result.isAcknowledged === 'boolean') {
          setIsAcknowledged(result.isAcknowledged);
          setAcknowledgedCount((prev) =>
            result.isAcknowledged ? prev + 1 : prev - 1,
          );
        } else {
          console.error('Invalid acknowledgement status:', result.isAcknowledged);
          toast.error('Failed to update acknowledgement status.');
        }
        toast.success(
          `Announcement ${result.isAcknowledged ? "acknowledged" : "unacknowledged"}.`,
        );
      } catch (error: any) {
        const errorMessage =
          error?.message || "Failed to update acknowledgement.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  const handleBookmark = () => {
    if (!currentUserId) {
      toast.error("Please sign in to interact with announcements.");
      return;
    }

    // Clear any previous errors
    setError(null);

    startBookmarkTransition(async () => {
      try {
        const result = await toggleAnnouncementBookmark(
          announcementId,
          currentUserId,
        );

        if (result.error) {
          setError(result.error);
          toast.error(result.error || "Failed to update bookmark.");
          return;
        }

        if (typeof result.isBookmarked === 'boolean') {
          setIsBookmarked(result.isBookmarked);
          toast.success(
            `Announcement ${result.isBookmarked ? "bookmarked" : "unbookmarked"}.`,
          );
        } else {
          console.error('Invalid bookmark status:', result.isBookmarked);
          toast.error('Failed to update bookmark status.');
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to update bookmark.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcknowledge}
          disabled={isAcknowledged || isPendingAcknowledge}
          className={cn(
            "flex items-center text-xs text-muted-foreground transition-all",
            isAcknowledged &&
              "text-green-600 dark:text-green-500 cursor-default",
          )}
        >
          {isPendingAcknowledge ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : isAcknowledged ? (
            <CheckCheck className="h-4 w-4 mr-1" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          <span>{acknowledgedCount}</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBookmark}
        disabled={isPendingBookmark}
        className={cn(
          "text-muted-foreground transition-all h-7 w-7",
          isBookmarked &&
            "text-yellow-500 dark:text-yellow-400  motion-bg-in-blue-500",
        )}
      >
        {isPendingBookmark ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookmarkIcon
            className={cn(
              "h-4 w-4",
              isBookmarked && "fill-yellow-500 dark:fill-yellow-400  ",
            )}
          />
        )}
        <span className="sr-only">
          {isBookmarked ? "Remove bookmark" : "Bookmark"}
        </span>
      </Button>
    </div>
  );
}
