"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns"; // Import date-fns for formatting
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  Loader2,
  PlusIcon,
} from "lucide-react"; // Import icons
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"; // Added Avatar imports
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar"; // Import Calendar
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"; // Import Dialog components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"; // Import Popover
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"; // Import RadioGroup
import { Textarea } from "~/components/ui/textarea";
import { AnnouncementPriority } from "~/db/types";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils"; // Import cn utility

// Define the shape of a single announcement for optimistic update
interface Announcement {
  id: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
  teamId: string;
  teamName: string;
  sender: {
    name: string | null;
    image?: string | null;
  };
}

// Define the structure for query data
interface InfiniteQueryData {
  pages: {
    announcements: Announcement[];
    nextCursor?: number;
    hasMore: boolean;
  }[];
  pageParams: (number | null | undefined)[];
}

// Update schema to include optional schedule date
const announcementFormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Announcement message cannot be empty." })
    .max(300, {
      message: "Announcement message cannot exceed 300 characters.",
    }),
  priority: z.nativeEnum(AnnouncementPriority, {
    required_error: "Priority is required.",
  }),
  scheduleDate: z.date().optional(), // Add optional schedule date
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// Update mutation function signature if needed (e.g., pass scheduleDate)
const createAnnouncement = async (variables: {
  content: string;
  priority: AnnouncementPriority;
  teamIds: string[];
  senderId: string;
  senderRole: string;
  scheduleDate?: Date; // Add optional scheduleDate
}) => {
  const res = await fetch("/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variables),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to create announcement. Please try again.",
    );
  }
  return res.json();
};

export function AnnouncementForm() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      content: "",
      priority: AnnouncementPriority.NORMAL,
      scheduleDate: undefined,
    },
  });

  const validRoles = ["teacher", "admin", "staff"];
  const role = session?.user?.role as string;

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      if (!session?.user?.id || !validRoles.includes(role)) return;
      try {
        // const res = await fetch(`/api/users/${session.user.id}/teams`);
        const res = await fetch("/api/teams");

        // const res = await fetch("/api/teams"); // Corrected endpoint
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.teams || []);
        // Pre-select all teams initially if needed, or none
        // setSelectedTeams(data.teams.map((t: { id: string }) => t.id));
      } catch (err) {
        setError("Failed to load teams.");
        console.error(err);
      }
    };
    void fetchTeams();
  }, [session?.user?.id, role]);

  const mutation = useMutation({
    mutationFn: createAnnouncement,
    // --- Keep existing onMutate logic ---
    onMutate: async (newAnnouncementData) => {
      // Re-enable optimistic updates with stricter immutability
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      const previousAnnouncementsAll =
        queryClient.getQueryData<InfiniteQueryData>(["announcements", "all"]);
      const previousAnnouncementsSelected = newAnnouncementData.teamIds
        .map((teamId) => ({
          teamId,
          data: queryClient.getQueryData<InfiniteQueryData>([
            "announcements",
            teamId,
          ]),
        }))
        .filter((item) => item.data);

      const optimisticAnnouncement: Announcement = {
        id: `optimistic-${Date.now()}`,
        content: newAnnouncementData.content,
        priority: newAnnouncementData.priority,
        // Use scheduleDate if provided, otherwise current time
        createdAt: newAnnouncementData.scheduleDate
          ? newAnnouncementData.scheduleDate.toISOString()
          : new Date().toISOString(),
        teamId: "", // Placeholder
        teamName: "", // Placeholder
        sender: {
          name: session?.user.name ?? "You",
          image: session?.user.image ?? null,
        },
      };

      // Helper function for immutable update
      const updateCacheImmutably = (
        oldData: InfiniteQueryData | undefined,
      ): InfiniteQueryData | undefined => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          // Return a new structure if cache is empty/invalid
          return {
            pages: [
              { announcements: [optimisticAnnouncement], hasMore: false },
            ],
            pageParams: [undefined],
          };
        }

        // Create a new pages array
        const newPages = oldData.pages.map((page, index) => {
          // Only modify the first page
          if (index === 0) {
            // Create a new announcements array for the first page
            const newAnnouncements = [
              optimisticAnnouncement,
              ...page.announcements,
            ];
            // Return a new page object with the new announcements array
            return { ...page, announcements: newAnnouncements };
          }
          // Return other pages unmodified
          return page;
        });

        // Return a new top-level object with the new pages array
        return {
          ...oldData,
          pages: newPages,
        };
      };

      // Update 'all' query cache using the immutable helper
      queryClient.setQueryData<InfiniteQueryData>(
        ["announcements", "all"],
        updateCacheImmutably,
      );

      // Update specific team query caches similarly
      for (const teamId of newAnnouncementData.teamIds) {
        queryClient.setQueryData<InfiniteQueryData>(
          ["announcements", teamId],
          updateCacheImmutably,
        );
      }

      // Return context for potential rollback
      return {
        previousAnnouncementsAll,
        previousAnnouncementsSelected,
      };
    },
    onError: (err, newAnnouncement, context: any) => {
      setError((err as Error).message || "Failed to send announcement.");
      toastAnnouncement("error", "Failed to send announcement.");
      // Rollback using the context
      if (context?.previousAnnouncementsAll) {
        queryClient.setQueryData(
          ["announcements", "all"],
          context.previousAnnouncementsAll,
        );
      }
      context?.previousAnnouncementsSelected?.forEach(
        (item: { teamId: string; data: InfiniteQueryData }) => {
          queryClient.setQueryData(["announcements", item.teamId], item.data);
        },
      );
    },
    onSuccess: () => {
      toastAnnouncement("success", "Announcement sent successfully!");
      form.reset(); // Reset form fields
      setSelectedTeams([]); // Clear selected teams
      setError(null);
      // Optionally invalidate queries to refetch fresh data, though optimistic update handles UI
      // queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onSettled: () => {
      // Ensure queries are fresh after mutation settles (success or error)
      // Consider selective invalidation based on selected teams
      queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
      selectedTeams.forEach((teamId) => {
        queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
      });
    },
  });

  const onSubmit = (values: AnnouncementFormValues) => {
    if (!session?.user?.id) {
      setError("User not authenticated.");
      return;
    }
    if (selectedTeams.length === 0) {
      setError("Please select at least one team.");
      return;
    }
    setError(null);
    mutation.mutate({
      ...values,
      teamIds: selectedTeams,
      senderId: session.user.id,
      senderRole: role,
    });
  };

  const handleTeamSelectionChange = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  if (!validRoles.includes(role)) {
    return null; // Or a message indicating permission denied
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm"
      >
        {/* Content Textarea */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Announcement</FormLabel> */}
              <FormControl>
                <Textarea
                  placeholder="What would you like to announce?"
                  className="resize-none border-none shadow-none focus-visible:ring-0 min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between gap-2 border-t pt-3">
          {/* Left Side Controls */}
          <div className="flex items-center gap-3">
            {/* Date/Time Picker */}
            <FormField
              control={form.control}
              name="scheduleDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[180px] justify-start text-left font-normal h-9",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PP") // Format date
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        // disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                      {/* Basic Time Input - Consider a dedicated component */}
                      {/* <div className="p-2 border-t">
                        <Input type="time" className="h-8" />
                      </div> */}
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>Schedule announcement (optional).</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Buttons */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  {/* <FormLabel>Priority</FormLabel> */}
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-1"
                    >
                      <FormItem className="flex items-center space-x-0 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value={AnnouncementPriority.NORMAL}
                            id="priority-normal"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="priority-normal"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                        >
                          !
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-0 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value={AnnouncementPriority.URGENT}
                            id="priority-urgent"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="priority-urgent"
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 [&:has([data-state=checked])]:border-destructive"
                        >
                          !!
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Team Selection */}
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 justify-start gap-2 px-3"
                >
                  <div className="flex -space-x-1 overflow-hidden">
                    {selectedTeams.length > 0 ? (
                      selectedTeams.slice(0, 3).map((teamId) => {
                        const team = teams.find((t) => t.id === teamId);
                        const teamNameInitial =
                          team?.name.charAt(0).toUpperCase() ?? "?";
                        // Assuming team object might have an image property, otherwise use initials
                        // const teamImage = team?.image;
                        return (
                          <Avatar
                            key={teamId}
                            className="inline-block h-5 w-5 border-background border"
                          >
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${team?.name}.png`}
                              alt={team?.name}
                            />
                            <AvatarFallback className="text-xs">
                              {teamNameInitial}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border bg-muted text-xs text-muted-foreground">
                        ?
                      </div>
                    )}
                    {selectedTeams.length > 3 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border bg-muted text-xs font-medium text-muted-foreground">
                        +{selectedTeams.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedTeams.length === 0
                      ? "Select Teams"
                      : `${selectedTeams.length} team${selectedTeams.length !== 1 ? "s" : ""} selected`}
                  </span>
                  <PlusIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Teams</DialogTitle>
                  <DialogDescription>
                    Choose which teams will receive this announcement.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[300px] space-y-2 overflow-y-auto py-2 pr-2">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                      >
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={selectedTeams.includes(team.id)}
                          onCheckedChange={() =>
                            handleTeamSelectionChange(team.id)
                          }
                        />
                        <label
                          htmlFor={`team-${team.id}`}
                          className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {team.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No teams available or loading...
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Submit Button */}
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={mutation.isPending || selectedTeams.length === 0}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Send Announcement</span>
            </Button>
          </div>
        </div>

        {/* Global Error Message */}
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </form>
    </Form>
  );
}

// "use client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { format } from "date-fns"; // Import date-fns for formatting
// import {
//   AlertTriangleIcon,
//   ArrowRightIcon,
//   CalendarIcon,
//   Loader2,
//   PlusIcon,
// } from "lucide-react"; // Import icons
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { toastAnnouncement } from "~/components/toast-announcement";
// import { Button } from "~/components/ui/button";
// import { Calendar } from "~/components/ui/calendar"; // Import Calendar
// import { Checkbox } from "~/components/ui/checkbox";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "~/components/ui/dialog"; // Import Dialog components
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "~/components/ui/popover"; // Import Popover
// import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"; // Import RadioGroup
// import { Textarea } from "~/components/ui/textarea";
// import { AnnouncementPriority } from "~/db/types";
// import { useSession } from "~/lib/auth-client";
// import { cn } from "~/lib/utils"; // Import cn utility

// // Define the shape of a single announcement for optimistic update
// interface Announcement {
//   id: string;
//   content: string;
//   priority: AnnouncementPriority;
//   createdAt: string;
//   teamId: string;
//   teamName: string;
//   sender: {
//     name: string | null;
//     image?: string | null;
//   };
// }

// // Define the structure for query data
// interface InfiniteQueryData {
//   pages: {
//     announcements: Announcement[];
//     nextCursor?: number;
//     hasMore: boolean;
//   }[];
//   pageParams: (number | null | undefined)[];
// }

// // Update schema to include optional schedule date
// const announcementFormSchema = z.object({
//   content: z
//     .string()
//     .min(1, { message: "Announcement message cannot be empty." })
//     .max(300, {
//       message: "Announcement message cannot exceed 300 characters.",
//     }),
//   priority: z.nativeEnum(AnnouncementPriority, {
//     required_error: "Priority is required.",
//   }),
//   scheduleDate: z.date().optional(), // Add optional schedule date
// });

// type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// // Update mutation function signature if needed (e.g., pass scheduleDate)
// const createAnnouncement = async (variables: {
//   content: string;
//   priority: AnnouncementPriority;
//   teamIds: string[];
//   senderId: string;
//   senderRole: string;
//   scheduleDate?: Date; // Add optional scheduleDate
// }) => {
//   const res = await fetch("/api/announcements", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(variables),
//   });
//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     throw new Error(
//       errorData.message || "Failed to create announcement. Please try again.",
//     );
//   }
//   return res.json();
// };

// export function AnnouncementForm() {
//   const { data: session } = useSession();
//   const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
//   const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
//   const queryClient = useQueryClient();

//   const form = useForm<AnnouncementFormValues>({
//     resolver: zodResolver(announcementFormSchema),
//     defaultValues: {
//       content: "",
//       priority: AnnouncementPriority.NORMAL,
//       scheduleDate: undefined,
//     },
//   });

//   const validRoles = ["teacher", "admin", "staff"];
//   const role = session?.user?.role as string;

//   // Fetch teams on component mount
//   useEffect(() => {
//     const fetchTeams = async () => {
//       if (!session?.user?.id || !validRoles.includes(role)) return;
//       try {
//         const res = await fetch(`/api/users/${session.user.id}/teams`);
//         if (!res.ok) throw new Error("Failed to fetch teams");
//         const data = await res.json();
//         setTeams(data.teams || []);
//         // Pre-select all teams initially if needed, or none
//         // setSelectedTeams(data.teams.map((t: { id: string }) => t.id));
//       } catch (err) {
//         setError("Failed to load teams.");
//         console.error(err);
//       }
//     };
//     void fetchTeams();
//   }, [session?.user?.id, role]);

//   const mutation = useMutation({
//     mutationFn: createAnnouncement,
//     // --- Keep existing onMutate logic ---
//     onMutate: async (newAnnouncementData) => {
//       // Re-enable optimistic updates with stricter immutability
//       await queryClient.cancelQueries({ queryKey: ["announcements"] });

//       const previousAnnouncementsAll =
//         queryClient.getQueryData<InfiniteQueryData>(["announcements", "all"]);
//       const previousAnnouncementsSelected = newAnnouncementData.teamIds
//         .map((teamId) => ({
//           teamId,
//           data: queryClient.getQueryData<InfiniteQueryData>([
//             "announcements",
//             teamId,
//           ]),
//         }))
//         .filter((item) => item.data);

//       const optimisticAnnouncement: Announcement = {
//         id: `optimistic-${Date.now()}`,
//         content: newAnnouncementData.content,
//         priority: newAnnouncementData.priority,
//         // Use scheduleDate if provided, otherwise current time
//         createdAt: newAnnouncementData.scheduleDate
//           ? newAnnouncementData.scheduleDate.toISOString()
//           : new Date().toISOString(),
//         teamId: "", // Placeholder
//         teamName: "", // Placeholder
//         sender: {
//           name: session?.user.name ?? "You",
//           image: session?.user.image ?? null,
//         },
//       };

//       // Helper function for immutable update
//       const updateCacheImmutably = (
//         oldData: InfiniteQueryData | undefined,
//       ): InfiniteQueryData | undefined => {
//         if (!oldData || !oldData.pages || oldData.pages.length === 0) {
//           // Return a new structure if cache is empty/invalid
//           return {
//             pages: [
//               { announcements: [optimisticAnnouncement], hasMore: false },
//             ],
//             pageParams: [undefined],
//           };
//         }

//         // Create a new pages array
//         const newPages = oldData.pages.map((page, index) => {
//           // Only modify the first page
//           if (index === 0) {
//             // Create a new announcements array for the first page
//             const newAnnouncements = [
//               optimisticAnnouncement,
//               ...page.announcements,
//             ];
//             // Return a new page object with the new announcements array
//             return { ...page, announcements: newAnnouncements };
//           }
//           // Return other pages unmodified
//           return page;
//         });

//         // Return a new top-level object with the new pages array
//         return {
//           ...oldData,
//           pages: newPages,
//         };
//       };

//       // Update 'all' query cache using the immutable helper
//       queryClient.setQueryData<InfiniteQueryData>(
//         ["announcements", "all"],
//         updateCacheImmutably,
//       );

//       // Update specific team query caches similarly
//       for (const teamId of newAnnouncementData.teamIds) {
//         queryClient.setQueryData<InfiniteQueryData>(
//           ["announcements", teamId],
//           updateCacheImmutably,
//         );
//       }

//       // Return context for potential rollback
//       return {
//         previousAnnouncementsAll,
//         previousAnnouncementsSelected,
//       };
//     },
//     onError: (err, newAnnouncement, context: any) => {
//       setError((err as Error).message || "Failed to send announcement.");
//       toastAnnouncement("error", "Failed to send announcement.");
//       // Rollback using the context
//       if (context?.previousAnnouncementsAll) {
//         queryClient.setQueryData(
//           ["announcements", "all"],
//           context.previousAnnouncementsAll,
//         );
//       }
//       context?.previousAnnouncementsSelected?.forEach(
//         (item: { teamId: string; data: InfiniteQueryData }) => {
//           queryClient.setQueryData(["announcements", item.teamId], item.data);
//         },
//       );
//     },
//     onSuccess: () => {
//       toastAnnouncement("success", "Announcement sent successfully!");
//       form.reset(); // Reset form fields
//       setSelectedTeams([]); // Clear selected teams
//       setError(null);
//       // Optionally invalidate queries to refetch fresh data, though optimistic update handles UI
//       // queryClient.invalidateQueries({ queryKey: ['announcements'] });
//     },
//     onSettled: () => {
//       // Ensure queries are fresh after mutation settles (success or error)
//       // Consider selective invalidation based on selected teams
//       queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
//       selectedTeams.forEach((teamId) => {
//         queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
//       });
//     },
//   });

//   const onSubmit = (values: AnnouncementFormValues) => {
//     if (!session?.user?.id) {
//       setError("User not authenticated.");
//       return;
//     }
//     if (selectedTeams.length === 0) {
//       setError("Please select at least one team.");
//       return;
//     }
//     setError(null);
//     mutation.mutate({
//       ...values,
//       teamIds: selectedTeams,
//       senderId: session.user.id,
//       senderRole: role,
//     });
//   };

//   const handleTeamSelectionChange = (teamId: string) => {
//     setSelectedTeams((prev) =>
//       prev.includes(teamId)
//         ? prev.filter((id) => id !== teamId)
//         : [...prev, teamId],
//     );
//   };

//   if (!validRoles.includes(role)) {
//     return null; // Or a message indicating permission denied
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="space-y-4 rounded-lg border bg-card p-4 shadow-sm"
//       >
//         {/* Content Textarea */}
//         <FormField
//           control={form.control}
//           name="content"
//           render={({ field }) => (
//             <FormItem>
//               {/* <FormLabel>Announcement</FormLabel> */}
//               <FormControl>
//                 <Textarea
//                   placeholder="What would you like to announce?"
//                   className="resize-none border-none shadow-none focus-visible:ring-0 min-h-[80px]"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Bottom Controls Row */}
//         <div className="flex items-center justify-between gap-2 border-t pt-3">
//           {/* Left Side Controls */}
//           <div className="flex items-center gap-3">
//             {/* Date/Time Picker */}
//             <FormField
//               control={form.control}
//               name="scheduleDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant="outline"
//                           className={cn(
//                             "w-[180px] justify-start text-left font-normal h-9",
//                             !field.value && "text-muted-foreground",
//                           )}
//                         >
//                           <CalendarIcon className="mr-2 h-4 w-4" />
//                           {field.value ? (
//                             format(field.value, "PP") // Format date
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value}
//                         onSelect={field.onChange}
//                         // disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
//                         initialFocus
//                       />
//                       {/* Basic Time Input - Consider a dedicated component */}
//                       {/* <div className="p-2 border-t">
//                         <Input type="time" className="h-8" />
//                       </div> */}
//                     </PopoverContent>
//                   </Popover>
//                   {/* <FormDescription>Schedule announcement (optional).</FormDescription> */}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Priority Buttons */}
//             <FormField
//               control={form.control}
//               name="priority"
//               render={({ field }) => (
//                 <FormItem className="space-y-0">
//                   {/* <FormLabel>Priority</FormLabel> */}
//                   <FormControl>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       className="flex items-center space-x-1"
//                     >
//                       <FormItem className="flex items-center space-x-0 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem
//                             value={AnnouncementPriority.NORMAL}
//                             id="priority-normal"
//                             className="peer sr-only"
//                           />
//                         </FormControl>
//                         <FormLabel
//                           htmlFor="priority-normal"
//                           className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
//                         >
//                           !
//                         </FormLabel>
//                       </FormItem>
//                       <FormItem className="flex items-center space-x-0 space-y-0">
//                         <FormControl>
//                           <RadioGroupItem
//                             value={AnnouncementPriority.URGENT}
//                             id="priority-urgent"
//                             className="peer sr-only"
//                           />
//                         </FormControl>
//                         <FormLabel
//                           htmlFor="priority-urgent"
//                           className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 [&:has([data-state=checked])]:border-destructive"
//                         >
//                           !!
//                         </FormLabel>
//                       </FormItem>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           {/* Right Side Controls */}
//           <div className="flex items-center gap-3">
//             {/* Team Selection */}
//             <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="h-9 justify-start gap-2 px-3"
//                 >
//                   <div className="flex -space-x-1 overflow-hidden">
//                     {/* Simple colored circles placeholder */}
//                     <span className="inline-block h-4 w-4 rounded-full bg-red-500 ring-2 ring-background" />
//                     <span className="inline-block h-4 w-4 rounded-full bg-yellow-500 ring-2 ring-background" />
//                     <span className="inline-block h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
//                   </div>
//                   <span className="text-sm font-medium text-muted-foreground">
//                     {selectedTeams.length} class
//                     {selectedTeams.length !== 1 ? "es" : ""}
//                   </span>
//                   <PlusIcon className="h-4 w-4 text-muted-foreground" />
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Select Teams</DialogTitle>
//                   <DialogDescription>
//                     Choose which teams will receive this announcement.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="max-h-[300px] space-y-2 overflow-y-auto py-2 pr-2">
//                   {teams.length > 0 ? (
//                     teams.map((team) => (
//                       <div
//                         key={team.id}
//                         className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
//                       >
//                         <Checkbox
//                           id={`team-${team.id}`}
//                           checked={selectedTeams.includes(team.id)}
//                           onCheckedChange={() =>
//                             handleTeamSelectionChange(team.id)
//                           }
//                         />
//                         <label
//                           htmlFor={`team-${team.id}`}
//                           className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                         >
//                           {team.name}
//                         </label>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-muted-foreground">
//                       No teams available or loading...
//                     </p>
//                   )}
//                 </div>
//                 <DialogFooter>
//                   <DialogClose asChild>
//                     <Button type="button" variant="secondary">
//                       Close
//                     </Button>
//                   </DialogClose>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               size="icon"
//               className="h-9 w-9 rounded-full"
//               disabled={mutation.isPending || selectedTeams.length === 0}
//             >
//               {mutation.isPending ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <ArrowRightIcon className="h-4 w-4" />
//               )}
//               <span className="sr-only">Send Announcement</span>
//             </Button>
//           </div>
//         </div>

//         {/* Global Error Message */}
//         {error && (
//           <p className="text-sm font-medium text-destructive">{error}</p>
//         )}
//       </form>
//     </Form>
//   );
// }
