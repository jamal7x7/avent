"use client";

import { RiAlertFill } from "@remixicon/react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ActivitySquare,
  AlertCircle,
  CalendarClock,
  Check,
  Clock,
  ClockAlert,
  Edit3,
  EyeClosed,
  EyeClosedIcon,
  EyeOff,
  FileText,
  MoreHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation"; // Added for navigation
import { startTransition, useEffect, useState } from "react"; // Added startTransition for View Transitions API
import { AnnouncementInteractions } from "~/components/announcement-interactions";

import { toast } from "sonner"; // For toast notifications
// import { AnnouncementActions } from "./announcement-actions"; // This was already commented out, but let's ensure it's not used if not needed.
import {
  deleteAnnouncementAction,
  draftAnnouncementAction,
  editAnnouncementAction,
  scheduleAnnouncementAction,
} from "~/app/actions/announcement";
// import { AnnouncementActions } from "~/components/announcement-actions"; // Will be replaced by direct implementation
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"; // Added
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AnnouncementPriority, AnnouncementStatus } from "~/db/types"; // Added AnnouncementStatus
import { cn } from "~/lib/utils";
import { EditAnnouncementDialog } from "./edit-announcement-dialog";
import { ScheduleAnnouncementDialog } from "./schedule-announcement-dialog";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    content: string;
    createdAt: string; // Assuming this is a string representation of a Date
    scheduledDate?: string | null;
    status?: AnnouncementStatus;
    teamName: string;
    teamAbbreviation?: string; // Added teamAbbreviation
    priority: AnnouncementPriority;
    sender: {
      id: string; // senderId is available at announcement.senderId if needed
      name: string | null;
      image?: string | null;
      email: string;
      // role?: string; // Not directly part of the sender object from fetchAnnouncements
    };
    isAcknowledged: boolean; // For the current user
    isBookmarked: boolean; // For the current user
    totalAcknowledged: number; // Total for the announcement
  };
  currentUserId?: string;
}

export function AnnouncementCard({
  announcement,
  currentUserId,
}: AnnouncementCardProps) {
  const router = useRouter(); // Added for navigation
  // const [isVisible, setIsVisible] = useState(false);
  const {
    id: announcementId,
    content,
    priority,
    status,
    scheduledDate,
    sender,
    teamName,
    teamAbbreviation,
  } = announcement; // Destructure for easier access

  // State for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // State for animation only
  const [isVisible, setIsVisible] = useState(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ensure the click is not on an interactive element (button, dropdown, etc.)
    // This can be done by checking e.target or by stopping propagation in child interactive elements.
    // For simplicity, we'll rely on stopping propagation in children for now.
    if (document.startViewTransition) {
      startTransition(() => {
        router.push(`/dashboard/announcements/${announcement.id}`);
      });
    } else {
      router.push(`/dashboard/announcements/${announcement.id}`);
    }
  };

  const senderName = sender.name ?? "Unknown User";
  const senderInitial = senderName.charAt(0).toUpperCase();
  // const teamAbbreviation = announcement.teamAbbreviation; // Removed redundant declaration, already destructured
  const teamDisplayInitial = teamAbbreviation
    ? teamAbbreviation.charAt(0).toUpperCase()
    : teamName.charAt(0).toUpperCase(); // Use destructured teamName

  const role = teamName.includes("Dev") // Use destructured teamName
    ? "Developer"
    : announcement.teamName.includes("Design")
      ? "Designer"
      : announcement.teamName.includes("Market")
        ? "Marketing"
        : "Teacher";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const displayDate = () => {
    if (status === AnnouncementStatus.SCHEDULED && scheduledDate) {
      return `Scheduled for ${format(
        new Date(scheduledDate),
        "MM/dd/yyyy 'at' HH:mm",
      )}`;
    }
    return formatDistanceToNow(new Date(announcement.createdAt), {
      addSuffix: true,
    });
  };

  const exactDate = format(
    new Date(announcement.createdAt),
    "MMM d, yyyy 'at' h:mm a",
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
  // const receivedCount = 12; // Replace with actual fetched count

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ viewTransitionName: `announcement-card-${announcement.id}` }} // Added for View Transitions API
          onClick={handleCardClick} // Added navigation handler
          role="link" // Added for accessibility
          tabIndex={0} // Added for accessibility
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCardClick(e as any);
            }
          }}
          className="cursor-pointer" // Added cursor pointer
        >
          <Card className=" rounded-2xl transition-shadow duration-300 hover:shadow-lg  ">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-0 pt-0 px-6 border-b border-border/40">
              <div className="relative">
                <Avatar
                  className={cn(
                    "h-12 w-12 border-2 border-border ring-2 ring-offset-2 ring-offset-background shadow-lg",
                    effectivePriorityStyles[priority]?.ring,
                    // priority === AnnouncementPriority.URGENT && "animate-pulse"
                  )}
                >
                  <AvatarImage
                    src={
                      announcement.sender.image ??
                      `https://avatar.vercel.sh/${
                        teamAbbreviation ?? announcement.teamName
                      }.png`
                    }
                    alt={senderName}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {teamDisplayInitial}
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
                    {announcement.teamAbbreviation ?? announcement.teamName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {displayDate()} {/* Updated to use displayDate */}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {status === AnnouncementStatus.SCHEDULED &&
                          scheduledDate
                            ? format(
                                new Date(scheduledDate),
                                "MMM d, yyyy 'at' h:mm a",
                              )
                            : exactDate}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {currentUserId &&
                      announcement.sender.id === currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <EditAnnouncementDialog
                              announcementId={announcementId}
                              currentContent={content}
                              open={isEditDialogOpen}
                              onOpenChange={setIsEditDialogOpen}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault(); // Prevent menu from closing
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            </EditAnnouncementDialog>
                            <ScheduleAnnouncementDialog
                              announcementId={announcementId}
                              currentScheduledDate={scheduledDate}
                              open={isScheduleDialogOpen}
                              onOpenChange={setIsScheduleDialogOpen}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault(); // Prevent menu from closing
                                  setIsScheduleDialogOpen(true);
                                }}
                              >
                                <CalendarClock className="mr-2 h-4 w-4" />
                                <span>Schedule</span>
                              </DropdownMenuItem>
                            </ScheduleAnnouncementDialog>
                            <DropdownMenuItem
                              onSelect={async () => {
                                console.log(
                                  "Draft clicked for:",
                                  announcementId,
                                );
                                const formData = new FormData();
                                formData.append(
                                  "announcementId",
                                  announcementId,
                                );
                                const result =
                                  await draftAnnouncementAction(formData);
                                if ("success" in result) {
                                  toast.success(result.success);
                                } else if ("error" in result) {
                                  toast.error(result.error);
                                }
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Draft</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onSelect={async () => {
                                console.log(
                                  "Delete clicked for:",
                                  announcementId,
                                );
                                if (
                                  confirm(
                                    "Are you sure you want to delete this announcement?",
                                  )
                                ) {
                                  const formData = new FormData();
                                  formData.append(
                                    "announcementId",
                                    announcementId,
                                  );
                                  const result =
                                    await deleteAnnouncementAction(formData);
                                  if ("success" in result) {
                                    toast.success(result.success);
                                  } else if ("error" in result) {
                                    toast.error(result.error);
                                  }
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
                            effectivePriorityStyles[priority].badge,
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

            <CardFooter className="flex justify-between items-center pt-4  px-6 border-t border-border/40">
              <div onClick={(e) => e.stopPropagation()}>
                {" "}
                {/* Prevent card click on interactions area */}
                <AnnouncementInteractions
                  announcementId={announcement.id}
                  currentUserId={currentUserId} // Ensure currentUserId is passed here
                  initialIsAcknowledged={announcement.isAcknowledged}
                  initialIsBookmarked={announcement.isBookmarked}
                  initialAcknowledgedCount={announcement.totalAcknowledged}
                />
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
