"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Info,
  Loader2,
  MoreHorizontal, // Added MoreHorizontal
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AnnouncementCard } from "~/components/announcement-card";
import { toastAnnouncement } from "~/components/toast-announcement";
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
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"; // Added DropdownMenu components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TimePicker } from "~/components/ui/time-picker";
import { type AnnouncementPriority, AnnouncementStatus } from "~/db/types";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

// This interface might need to align more closely with what AnnouncementCard expects,
// or the mapping when calling AnnouncementCard needs to be thorough.
// For now, keeping it as is, but noting that the API at /api/announcements/scheduled
// will need to provide all necessary fields for AnnouncementCard.
interface ScheduledAnnouncement {
  id: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
  scheduledDate: string; // Should be ISO string
  status: AnnouncementStatus;
  teamIds: string[];
  teamNames: string[]; // Consider if a single teamName and teamAbbreviation is more appropriate for AnnouncementCard
  teamAbbreviation?: string; // Add to match AnnouncementCard if possible from API
  senderId: string;
  // Add fields expected by AnnouncementCard, to be populated by fetchScheduledAnnouncements
  sender: {
    id: string;
    name: string | null;
    image?: string | null;
    email: string;
  };
  isAcknowledged: boolean;
  isBookmarked: boolean;
  totalAcknowledged: number;
}

// Function to fetch scheduled announcements
const fetchScheduledAnnouncements = async (teamId?: string) => {
  const url =
    teamId && teamId !== "all"
      ? `/api/announcements/scheduled?teamId=${teamId}`
      : "/api/announcements/scheduled";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch scheduled announcements");
  }
  return res.json();
};

// Function to fetch teams
const fetchTeams = async () => {
  const res = await fetch("/api/teams");
  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }
  return res.json();
};

// Function to update a scheduled announcement
const updateScheduledAnnouncement = async ({
  id,
  scheduledDate,
  status,
}: {
  id: string;
  scheduledDate?: Date;
  status?: AnnouncementStatus;
}) => {
  const res = await fetch(`/api/announcements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scheduledDate: scheduledDate?.toISOString(),
      status,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to update announcement");
  }
  return res.json();
};

interface ScheduledAnnouncementsProps {
  selectedTeam: string; // Prop from parent
  // teams: { id: string; name: string }[]; // Teams list can also be passed if not fetched internally or if parent already has it
}

export function ScheduledAnnouncements({
  selectedTeam,
}: ScheduledAnnouncementsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<ScheduledAnnouncement | null>(null);
  const [newScheduledDate, setNewScheduledDate] = useState<Date | undefined>(
    undefined,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [announcementToCancel, setAnnouncementToCancel] = useState<
    string | null
  >(null);
  const [announcementToUnpublish, setAnnouncementToUnpublish] = useState<
    string | null
  >(null);
  // const [tabValue, setTabValue] = useState("scheduled"); // Tab value will be managed by parent
  // const [selectedTeamState, setSelectedTeamState] = useState(selectedTeam); // Use prop directly
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]); // Still fetch teams for now, or pass as prop
  const router = useRouter(); // Keep for "Create Scheduled Announcement" button

  const validRoles = ["teacher", "admin", "staff"];
  const role = session?.user?.role as string;

  // Fetch teams (can be optimized if parent passes teams)
  useEffect(() => {
    const getTeams = async () => {
      if (!session?.user?.id || !validRoles.includes(role)) return;
      try {
        const data = await fetchTeams(); // This might be redundant if parent already has teams
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to load teams:", err);
      }
    };
    void getTeams();
  }, [session?.user?.id, role]);

  // Query for scheduled announcements, now using selectedTeam prop
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["scheduledAnnouncements", selectedTeam], // Use prop in queryKey
    queryFn: () => fetchScheduledAnnouncements(selectedTeam), // Use prop in queryFn
    enabled: !!session?.user?.id && validRoles.includes(role),
  });

  // Refetch when selectedTeam prop changes
  useEffect(() => {
    refetch();
  }, [selectedTeam, refetch]); // Depend on the prop

  // Mutation for updating announcements
  const updateMutation = useMutation({
    mutationFn: updateScheduledAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledAnnouncements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setIsEditDialogOpen(false);
      setSelectedAnnouncement(null);
      setNewScheduledDate(undefined);
    },
  });

  // Handle opening the edit dialog
  const handleEditClick = (announcement: ScheduledAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setNewScheduledDate(
      announcement.scheduledDate
        ? new Date(announcement.scheduledDate)
        : undefined,
    );
    setIsEditDialogOpen(true);
  };

  // Handle updating the scheduled date
  const handleUpdateSchedule = () => {
    if (!selectedAnnouncement) return;

    updateMutation.mutate(
      {
        id: selectedAnnouncement.id,
        scheduledDate: newScheduledDate,
        status: AnnouncementStatus.SCHEDULED,
      },
      {
        onSuccess: () => {
          toastAnnouncement("success", "Announcement schedule updated!");
        },
        onError: (error) => {
          toastAnnouncement(
            "error",
            `Failed to update schedule: ${error.message}`,
          );
        },
      },
    );
  };

  // Handle cancelling a scheduled announcement
  const handleCancelAnnouncement = (id: string) => {
    updateMutation.mutate(
      {
        id,
        status: AnnouncementStatus.CANCELLED,
      },
      {
        onSuccess: () => {
          toastAnnouncement("success", "Announcement cancelled!");
          setAnnouncementToCancel(null);
        },
        onError: (error) => {
          toastAnnouncement(
            "error",
            `Failed to cancel announcement: ${error.message}`,
          );
          setAnnouncementToCancel(null);
        },
      },
    );
  };

  // Handle unpublishing (setting to draft)
  const handleUnpublishAnnouncement = (id: string) => {
    updateMutation.mutate(
      {
        id,
        status: AnnouncementStatus.DRAFT,
      },
      {
        onSuccess: () => {
          toastAnnouncement(
            "success",
            "Announcement unpublished and saved as draft!",
          );
          setAnnouncementToUnpublish(null);
        },
        onError: (error) => {
          toastAnnouncement(
            "error",
            `Failed to unpublish announcement: ${error.message}`,
          );
          setAnnouncementToUnpublish(null);
        },
      },
    );
  };

  // Open cancel confirmation dialog
  const openCancelDialog = (id: string) => {
    setAnnouncementToCancel(id);
  };

  // Open unpublish confirmation dialog
  const openUnpublishDialog = (id: string) => {
    setAnnouncementToUnpublish(id);
  };

  if (!validRoles.includes(role)) {
    return null; // Only show to authorized roles
  }

  const scheduledAnnouncements = data?.announcements || [];

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading scheduled announcements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading scheduled announcements: {(error as Error).message}
      </div>
    );
  }

  if (scheduledAnnouncements.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/20 flex flex-col items-center gap-4 mt-6">
        <CalendarClock className="h-12 w-12 text-muted-foreground/60" />
        <h3 className="text-lg font-medium">No Scheduled Announcements</h3>
        <p className="text-muted-foreground max-w-md">
          {selectedTeam !== "all"
            ? "There are no scheduled announcements for this team. Try selecting a different team or create a new scheduled announcement."
            : "There are no scheduled announcements. You can create a new announcement and schedule it for future delivery."}
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => router.push("/dashboard/announcements/new")}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Create Scheduled Announcement
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {" "}
      {/* Added mt-6 for spacing from parent controls */}
      {/* The H2 and filter controls are removed as they will be handled by AnnouncementListClient */}
      {/* <h2 className="text-xl font-semibold">Scheduled Announcements</h2> */}
      <div className="flex flex-col gap-6">
        {" "}
        {/* Increased gap */}
        {scheduledAnnouncements.map((announcement: ScheduledAnnouncement) => (
          <div key={announcement.id} className="relative group">
            {/* Removed the specific DropdownMenu for scheduled items. 
                AnnouncementCard will provide its own generic Edit/Schedule/Draft/Delete.
                If "Edit Schedule" needs to be a distinct action from "Edit Content",
                this will require further refinement in AnnouncementCard or a new prop.
            */}
            <div className=" mt-4 mb-4 flex flex-col sm:flex-row gap-2 z-10">
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-200 flex items-center gap-1 px-3 py-1.5 shadow-sm"
              >
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                <span className="whitespace-nowrap">
                  {format(new Date(announcement.scheduledDate), "PPP")} at{" "}
                  {format(new Date(announcement.scheduledDate), "p")}
                </span>
              </Badge>
            </div>

            <AnnouncementCard
              announcement={{
                id: announcement.id,
                content: announcement.content,
                createdAt: announcement.createdAt,
                scheduledDate: announcement.scheduledDate, // Pass scheduledDate
                status: announcement.status, // Pass status
                teamName: announcement.teamNames[0] || "Scheduled Team", // Pass first team name or a default
                teamAbbreviation: announcement.teamAbbreviation, // Pass abbreviation if available
                priority: announcement.priority,
                sender: announcement.sender || {
                  // Use actual sender if fetched, else default
                  id: announcement.senderId, // Use senderId from scheduled announcement
                  name: "Unknown Sender", // Default or fetch actual sender name
                  image: null,
                  email: "",
                },
                isAcknowledged:
                  announcement.isAcknowledged !== undefined
                    ? announcement.isAcknowledged
                    : false, // Default if not provided
                isBookmarked:
                  announcement.isBookmarked !== undefined
                    ? announcement.isBookmarked
                    : false, // Default if not provided
                totalAcknowledged:
                  announcement.totalAcknowledged !== undefined
                    ? announcement.totalAcknowledged
                    : 0, // Default if not provided
              }}
              currentUserId={session?.user?.id}
            />
          </div>
        ))}
      </div>
      {/* 
        Removed the duplicated card rendering and standalone dialogs from here.
        The AnnouncementCard component itself handles Edit/Schedule/Draft/Delete.
        If specific actions like "Cancel Scheduled" or "Unpublish to Draft" are needed
        distinctly for scheduled items, they would typically be integrated into
        the AnnouncementCard's dropdown logic based on announcement.status,
        or this ScheduledAnnouncements component would need its own more specialized card.
        For now, relying on AnnouncementCard's generic actions.
      */}
    </div>
  );
}
