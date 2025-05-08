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

interface ScheduledAnnouncement {
  id: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
  scheduledDate: string;
  status: AnnouncementStatus;
  teamIds: string[];
  teamNames: string[];
  senderId: string; // Added senderId
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

export function ScheduledAnnouncements() {
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
  const [tabValue, setTabValue] = useState("scheduled");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  const validRoles = ["teacher", "admin", "staff"];
  const role = session?.user?.role as string;

  // Handle team filter change
  const handleFilterChange = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTabValue(value);
    if (value === "announcements") {
      router.push("/dashboard/announcements");
    } else {
      router.push("/dashboard/announcements/scheduled");
    }
  };

  // Fetch teams
  useEffect(() => {
    const getTeams = async () => {
      if (!session?.user?.id || !validRoles.includes(role)) return;
      try {
        const data = await fetchTeams();
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to load teams:", err);
      }
    };
    void getTeams();
  }, [session?.user?.id, role]);

  // Query for scheduled announcements
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["scheduledAnnouncements", selectedTeam],
    queryFn: () => fetchScheduledAnnouncements(selectedTeam),
    enabled: !!session?.user?.id && validRoles.includes(role),
  });

  // Refetch when selectedTeam changes
  useEffect(() => {
    refetch();
  }, [selectedTeam, refetch]);

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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <Tabs
              value={tabValue}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Filter by team:</span>
            <Select onValueChange={handleFilterChange} value={selectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 text-center">
          Loading scheduled announcements...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <Tabs
              value={tabValue}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Filter by team:</span>
            <Select onValueChange={handleFilterChange} value={selectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 text-center text-destructive">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (scheduledAnnouncements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <Tabs
              value={tabValue}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Filter by team:</span>
            <Select onValueChange={handleFilterChange} value={selectedTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-8 text-center border rounded-lg bg-muted/20 flex flex-col items-center gap-4">
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="flex-1">
          <Tabs
            value={tabValue}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-[240px]">
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Filter by team:</span>
          <Select onValueChange={handleFilterChange} value={selectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <h2 className="text-xl font-semibold">Scheduled Announcements</h2>
      <div className="flex flex-col gap-4">
        {scheduledAnnouncements.map((announcement: ScheduledAnnouncement) => (
          <div key={announcement.id} className="relative group">
            <AnnouncementCard
              announcement={{
                id: announcement.id,
                content: announcement.content,
                createdAt: announcement.createdAt,
                teamName: announcement.teamNames.join(", "),
                priority: announcement.priority,
                sender: {
                  id: session?.user?.id || "", // Ensure sender.id is passed if needed by AnnouncementCard's announcement prop structure
                  name: session?.user?.name || "Unknown",
                  image: session?.user?.image,
                  email: session?.user?.email || "",
                },
              }}
              currentUserId={session?.user?.id}
            />
            {session?.user?.id === announcement.senderId && (
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditClick(announcement)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openCancelDialog(announcement.id)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openUnpublishDialog(announcement.id)}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Save as Draft
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 z-10">
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
          </div>
        ))}
      </div>

      {/* Edit Schedule Dialog */}
      {data?.scheduledAnnouncements?.length === 0 && !isLoading && (
        <li className="text-muted-foreground text-center">
          No scheduled announcements found for this team.
        </li>
      )}
      {data?.scheduledAnnouncements?.map((a: ScheduledAnnouncement) => (
        <Card
          key={a.id}
          className="w-full md:w-2xl rounded-2xl transition-shadow duration-300 hover:shadow-lg"
        >
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-0 pt-0 px-6 border-b border-border/40">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground/90">
                {a.teamNames.join(", ")}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Scheduled:{" "}
                  {format(new Date(a.scheduledDate), "MMM d, yyyy 'at' h:mm a")}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Status: {a.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={isEditDialogOpen && selectedAnnouncement?.id === a.id}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) {
                    setSelectedAnnouncement(null);
                    setNewScheduledDate(undefined);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit scheduled announcement"
                    onClick={() => {
                      setSelectedAnnouncement(a);
                      setNewScheduledDate(new Date(a.scheduledDate));
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Scheduled Announcement</DialogTitle>
                    <DialogDescription>
                      Change the scheduled date and time for this announcement.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Calendar
                      mode="single"
                      selected={newScheduledDate}
                      onSelect={setNewScheduledDate}
                      className="rounded-md border"
                    />
                    <TimePicker
                      date={newScheduledDate}
                      setDate={setNewScheduledDate}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (!selectedAnnouncement || !newScheduledDate) return;
                        updateMutation.mutate({
                          id: selectedAnnouncement.id,
                          scheduledDate: newScheduledDate,
                        });
                      }}
                      disabled={updateMutation.isLoading || !newScheduledDate}
                    >
                      {updateMutation.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <AlertDialog
                open={announcementToCancel === a.id}
                onOpenChange={(open) => {
                  if (!open) setAnnouncementToCancel(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Cancel scheduled announcement"
                    onClick={() => setAnnouncementToCancel(a.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Cancel Scheduled Announcement
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this scheduled
                      announcement? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="outline">No, keep it</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          updateMutation.mutate({
                            id: a.id,
                            status: "CANCELLED",
                          });
                          setAnnouncementToCancel(null);
                        }}
                        disabled={updateMutation.isLoading}
                      >
                        {updateMutation.isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Yes, cancel"
                        )}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <div className="text-base text-foreground/90 whitespace-pre-line">
              {a.content}
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-4 pt-0 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Created:{" "}
              {format(new Date(a.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
            <Badge variant="secondary" className="text-xs">
              Priority: {a.priority}
            </Badge>
          </CardFooter>
        </Card>
      ))}
      {/* Cancel Announcement Alert Dialog */}
      <AlertDialog
        open={!!announcementToCancel}
        onOpenChange={(open) => !open && setAnnouncementToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this scheduled announcement? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it scheduled</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                announcementToCancel &&
                handleCancelAnnouncement(announcementToCancel)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel announcement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Announcement Alert Dialog */}
      <AlertDialog
        open={!!announcementToUnpublish}
        onOpenChange={(open) => !open && setAnnouncementToUnpublish(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as Draft</AlertDialogTitle>
            <AlertDialogDescription>
              This will unpublish the scheduled announcement and save it as a
              draft. You can edit and reschedule it later. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                announcementToUnpublish &&
                handleUnpublishAnnouncement(announcementToUnpublish)
              }
            >
              Save as Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
