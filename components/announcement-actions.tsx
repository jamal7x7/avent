"use client";

import {
  BookmarkIcon,
  CheckCheck,
  CheckIcon,
  HeartIcon,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  toggleAnnouncementAcknowledge,
  toggleAnnouncementBookmark,
} from "~/app/dashboard/announcements/actions";
import { Button } from "~/components/ui/button";

interface AnnouncementActionsProps {
  announcementId: string;
  initialIsAcknowledged: boolean | undefined;
  initialIsBookmarked: boolean | undefined;
}

export function AnnouncementActions({
  announcementId,
  initialIsAcknowledged,
  initialIsBookmarked,
}: // userId,
AnnouncementActionsProps) {
  // const { data: session } = useSession();
  // const userId = session?.user?.id;

  const [isAcknowledged, setIsAcknowledged] = useState(initialIsAcknowledged);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPendingAcknowledged, startAcknowledgedTransition] = useTransition();
  const [isPendingFavorite, startFavoriteTransition] = useTransition();
  const [isPendingBookmark, startBookmarkTransition] = useTransition();
  const [AcknowledgedCount, setAcknowledgedCount] = useState(12); // Dummy initial count - This should come from backend

  const handleReceive = () => {
    startAcknowledgedTransition(async () => {
      try {
        // TODO: Replace with actual userId from session
        const userId = "mock-user-id";
        const result = await toggleAnnouncementAcknowledge(
          announcementId,
          userId,
        );
        setIsAcknowledged(result.isAcknowledged);
        // Optionally update count or show toast
      } catch (error) {
        console.error("Failed to mark as received:", error);
      }
    });
  };

  const handleFavorite = () => {
    startFavoriteTransition(async () => {
      try {
        // TODO: Replace with actual userId from session
        const userId = "mock-user-id";
        const result = await toggleAnnouncementBookmark(announcementId, userId);
        setIsBookmarked(result.isBookmarked);
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isAcknowledged ? "secondary" : "ghost"}
        size="sm"
        onClick={handleReceive}
        disabled={isAcknowledged || isPendingAcknowledged}
        className={`transition-all ${isAcknowledged ? "cursor-default text-green-600 dark:text-green-500" : ""}`}
      >
        {isPendingAcknowledged ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          ""
        )}

        {!isAcknowledged ? (
          <CheckIcon className="w-4 h-4 mr-0" />
        ) : (
          <CheckCheck className="w-4 h-4 mr-0" />
        )}
        {isAcknowledged ? "Acknowledged" : ""}
      </Button>

      <div className="flex items-center text-xs text-muted-foreground">
        <span>{AcknowledgedCount} Received</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        disabled={isPendingFavorite}
        className={`transition-all ${isBookmarked ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500" : ""}`}
      >
        {isPendingBookmark ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <BookmarkIcon
            className={`w-4 h-4 mr-0 transition-colors ${isBookmarked ? "fill-yellow-500 dark:fill-yellow-400" : ""}`}
          />
        )}
        {/* {isBookmarked ? "Bookmarked" : "Bookmark"} */}
      </Button>
    </div>
  );
}
