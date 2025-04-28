import { Button } from "~/components/ui/button";
import { CheckIcon, HeartIcon } from "lucide-react";

interface AnnouncementActionsProps {
  announcementId: string;
}

export function AnnouncementActions({ announcementId }: AnnouncementActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <CheckIcon className="w-4 h-4 mr-1" />
        Received
      </Button>
      <Button variant="ghost" size="sm">
        <HeartIcon className="w-4 h-4 mr-1" />
        Favorite
      </Button>
    </div>
  );
}
