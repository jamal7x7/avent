"use client";

import {
  BookmarkIcon,
  CheckCheck,
  CheckIcon,
  HeartIcon,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
// import { useSession } from "better-auth/react"; // Assuming path for auth hook
// import {
//   markAnnouncementAsReceived,
//   toggleAnnouncementFavorite,
// } from "~/app/actions/announcements"; // Assuming path for server actions

interface AnnouncementActionsProps {
  announcementId: string;
  initialIsReceived: boolean;
  initialIsFavorited: boolean;
  // userId: string; // Or get from session
}

export function AnnouncementActions({
  announcementId,
  initialIsReceived,
  initialIsFavorited,
}: // userId,
  AnnouncementActionsProps) {
  // const { data: session } = useSession();
  // const userId = session?.user?.id;

  const [isReceived, setIsReceived] = useState(initialIsReceived);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPendingReceive, startReceiveTransition] = useTransition();
  const [isPendingFavorite, startFavoriteTransition] = useTransition();

  const [receivedCount, setReceivedCount] = useState(12); // Dummy initial count - This should come from backend

  const handleReceive = () => {
    // if (!userId) return; // Add proper auth check
    startReceiveTransition(async () => {
      try {
        // await markAnnouncementAsReceived(announcementId, userId);
        console.log("Marking as received (placeholder)", announcementId);
        setIsReceived(true);
        // Add toast notification for success
      } catch (error) {
        console.error("Failed to mark as received:", error);
        // Add toast notification for error
      }
    });
  };

  const handleFavorite = () => {
    // if (!userId) return; // Add proper auth check
    startFavoriteTransition(async () => {
      try {
        // const newState = await toggleAnnouncementFavorite(announcementId, userId);
        const newState = !isFavorited; // Placeholder
        console.log(
          "Toggling favorite (placeholder)",
          announcementId,
          newState,
        );
        setIsFavorited(newState);
        // Add toast notification for success
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        // Add toast notification for error
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isReceived ? "secondary" : "ghost"}
        size="sm"
        onClick={handleReceive}
        disabled={isReceived || isPendingReceive}
        className={`transition-all ${isReceived ? "cursor-default text-green-600 dark:text-green-500" : ""}`}
      >
        {isPendingReceive ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          ""
        )}

        {!isReceived ? (
          <CheckIcon className="w-4 h-4 mr-0" />
        ) : (
          <CheckCheck className="w-4 h-4 mr-0" />
        )}
        {isReceived ? "Received" : ""}
      </Button>

      <div className="flex items-center text-xs text-muted-foreground">
        <span>{receivedCount} Received</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        disabled={isPendingFavorite}
        className={`transition-all ${isFavorited ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500" : ""}`}
      >
        {isPendingFavorite ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <BookmarkIcon
            className={`w-4 h-4 mr-0 transition-colors ${isFavorited ? "fill-yellow-500 dark:fill-yellow-400" : ""}`}
          />
        )}
        {/* {isFavorited ? "Favorited" : "Favorite"} */}
      </Button>
    </div>
  );
}
