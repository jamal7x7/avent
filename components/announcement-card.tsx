"use client";

import { RiAlertFill } from "@remixicon/react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ActivitySquare,
  AlertCircle,
  BookmarkIcon,
  Check,
  Clock,
  ClockAlert,
  EyeClosed,
  EyeClosedIcon,
  EyeOff,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AnnouncementActions } from "~/components/announcement-actions"; // Import the refactored component
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AnnouncementPriority } from "~/db/types"; // Import priority enum
import { cn } from "~/lib/utils"; // Import cn utility

interface AnnouncementCardProps {
  announcement: {
    id: string;
    content: string;
    createdAt: string;
    teamName: string;
    priority: AnnouncementPriority;
    sender: {
      name: string | null; // Allow null for name
      image?: string | null; // Allow null for image
      email: string; // Add email property
      role?: string; // Add role property if needed
    };
  };
  // Add initial states if fetched server-side
  // initialIsReceived?: boolean;
  // initialIsFavorited?: boolean;
}
// Add user ID if needed and fetched server-side
// userId?: string;
// Removed extra closing brace causing parse error
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  // Remove local state for received/bookmarked as it's handled in AnnouncementActions
  // const [received, setReceived] = useState(false);
  // const [bookmarked, setBookmarked] = useState(false);
  // const [receivedCount, setReceivedCount] = useState(12); // Dummy initial count - This should come from backend
  const [isVisible, setIsVisible] = useState(false);

  // Determine priority based on content length (dummy logic)
  // Removed duplicate priority declaration
  const { priority } = announcement; // Use the actual priority from props

  // Get sender information
  const senderName = announcement.sender.name ?? "Unknown User";
  const senderInitial = senderName.charAt(0).toUpperCase();
  const teamNameInitial = announcement.teamName.charAt(0).toUpperCase();

  // Dummy role based on team name
  const role = announcement.teamName.includes("Dev")
    ? "Developer"
    : announcement.teamName.includes("Design")
      ? "Designer"
      : announcement.teamName.includes("Market")
        ? "Marketing"
        : "Teacher";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formattedDate = formatDistanceToNow(new Date(announcement.createdAt), {
    addSuffix: true,
  });

  const exactDate = format(
    new Date(announcement.createdAt),
    "MMM d, yyyy 'at' h:mm a"
  );

  const roleColors = {
    Teacher: "bg-emerald-900/60 text-emerald-300",
    Developer: "bg-violet-900/60 text-violet-300",
    Designer: "bg-pink-900/60 text-pink-300",
    Marketing: "bg-amber-900/60 text-amber-300",
  };

  const priorityStyles: Record<
    AnnouncementPriority,
    { badge: string; ring: string; icon?: React.ReactNode }
  > = {
    [AnnouncementPriority.NORMAL]: {
      badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      ring: "ring-blue-500/50",
    },
    [AnnouncementPriority.HIGH]: {
      badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      ring: "ring-yellow-500",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    [AnnouncementPriority.URGENT]: {
      badge: "bg-destructive/10 text-destructive border-destructive/20",
      ring: "ring-destructive",
      icon: <Star className="h-3 w-3 fill-destructive" />,
    },
  };

  const roleColor =
    roleColors[role as keyof typeof roleColors] ||
    "bg-gray-800/60 text-gray-300";

  // Use existing priorityStyles from props or fallback to default values
  const effectivePriorityStyles = {
    [AnnouncementPriority.NORMAL]: {
      badge: "bg-secondary text-secondary-foreground",
      ring: "ring-secondary",
      icon: <Check className="h-3 w-3" />,
    },
    [AnnouncementPriority.HIGH]: {
      badge: "bg-yellow-500/20 text-yellow-500",
      ring: "ring-yellow-500",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    [AnnouncementPriority.URGENT]: {
      badge: "bg-destructive/20 text-destructive",
      ring: "ring-destructive",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  // Existing code using effectivePriorityStyles

  // Placeholder for actual received count - fetch this data
  const receivedCount = 12; // Replace with actual fetched count

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="w-full md:w-2xl rounded-2xl transition-shadow duration-300 hover:shadow-lg ">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-0 pt-0 px-6 border-b border-border/40">
              <div className="relative">
                <Avatar
                  className={cn(
                    "h-12 w-12 border-2 border-border ring-2 ring-offset-2 ring-offset-background shadow-lg",
                    effectivePriorityStyles[priority]?.ring
                    // priority === AnnouncementPriority.URGENT && "animate-pulse"
                  )}
                >
                  <AvatarImage
                    src={
                      announcement.sender.image ??
                      `https://avatar.vercel.sh/${announcement.teamName}.png`
                    }
                    alt={senderName}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {teamNameInitial}
                  </AvatarFallback>
                </Avatar>
                {priority === AnnouncementPriority.URGENT && (
                  <div className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5 border-2 border-background">
                    <AlertCircle className="h-3 w-3  text-card-foreground animate-ping" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold tracking-tight text-foreground/90">
                    {announcement.teamName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formattedDate}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{exactDate}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="py-1 pr-1 pl-2 font-normal text-accent-foreground/40 hover:bg-accent/20"
                  >
                    {announcement.sender.name}
                    <Badge
                      variant="secondary"
                      className="border-transparent  font-medium bg-primary/10 text-primary/50 hover:bg-primary/20"
                    >
                      {role}
                    </Badge>
                  </Badge>
                  {priority !== AnnouncementPriority.NORMAL && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={
                            priority === AnnouncementPriority.URGENT
                              ? "destructive"
                              : "secondary"
                          }
                          className={cn(
                            "gap-1 capitalize",
                            effectivePriorityStyles[priority].badge
                          )}
                        >
                          {effectivePriorityStyles[priority].icon}
                          {priority}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Priority:{" "}
                          <span className="capitalize">{priority}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-5 px-6 text-card-foreground text-md leading-relaxed">
              <div className="pl-4 border-l-4 border-border py-1">
                <p>{announcement.content}</p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4 pb-0 px-6 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
              // onClick={handleShowAnnouncement}
              // disabled={isPendingShowAnnouncement}
              // className={`transition-all ${isShown ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500" : ""}`}
              >
                <div className="flex items-center text-xs text-muted-foreground">
                  <EyeClosed className="h-4 w-4 mr-1 " />
                  <span> Hide</span>
                </div>
              </Button>
              <AnnouncementActions
                announcementId={announcement.id}
                initialIsReceived={false}
                initialIsFavorited={false}
              />
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
