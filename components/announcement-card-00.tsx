import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"; // Use Shadcn Avatar
import { Badge } from "~/components/ui/badge"; // Import Badge
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AnnouncementActions } from "./announcement-actions";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    content: string;
    createdAt: string;
    teamName: string;
    sender: {
      name: string | null; // Allow null for name
      image?: string | null; // Allow null for image
    };
    isReceived: boolean; // Add isReceived
    isFavorited: boolean; // Add isFavorited
  };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const senderName = announcement.sender.name ?? "Unknown User";
  const senderInitial = senderName.charAt(0).toUpperCase();

  return (
    <Card className="shadow-sm w-full md:w-2xl hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3 border-b">
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={announcement.sender.image ?? undefined}
            alt={senderName}
          />
          <AvatarFallback>{senderInitial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {senderName}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(announcement.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs font-normal mt-1">
            To: {announcement.teamName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-3">
        <p className="text-sm text-foreground leading-relaxed">
          {announcement.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end items-center pt-3">
        <AnnouncementActions
          announcementId={announcement.id}
          initialIsReceived={announcement.isReceived}
          initialIsFavorited={announcement.isFavorited}
        />
      </CardFooter>
    </Card>
  );
}
