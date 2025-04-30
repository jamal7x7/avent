"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Import loader icon
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea"; // Import Textarea
import { AnnouncementPriority } from "~/db/types";
import { useSession } from "~/lib/auth-client";

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
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// Define the mutation function
const createAnnouncement = async (variables: {
  content: string;
  priority: AnnouncementPriority;
  teamIds: string[];
  senderId: string;
  senderRole: string;
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
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      content: "",
      priority: AnnouncementPriority.NORMAL,
    },
  });

  const validRoles = ["teacher", "admin", "staff"];
  const role = session?.user?.role as string;

  const mutation = useMutation({
    mutationFn: createAnnouncement,
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
        createdAt: new Date().toISOString(),
        teamId: "", // Placeholder
        teamName: "", // Placeholder
        sender: {
          name: session?.user.name ?? "You",
          image: session?.user.image ?? null,
        },
      };

      // Helper function for immutable update
      const updateCacheImmutably = (oldData: InfiniteQueryData | undefined): InfiniteQueryData | undefined => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          // Return a new structure if cache is empty/invalid
          return {
            pages: [{ announcements: [optimisticAnnouncement], hasMore: false }],
            pageParams: [undefined],
          };
        }

        // Create a new pages array
        const newPages = oldData.pages.map((page, index) => {
          // Only modify the first page
          if (index === 0) {
            // Create a new announcements array for the first page
            const newAnnouncements = [optimisticAnnouncement, ...page.announcements];
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
        updateCacheImmutably
      );

      // Update specific team query caches similarly
      for (const teamId of newAnnouncementData.teamIds) {
        queryClient.setQueryData<InfiniteQueryData>(
          ["announcements", teamId],
          updateCacheImmutably
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
      for (const { teamId, data } of context?.previousAnnouncementsSelected ??
        []) {
        if (data) {
          queryClient.setQueryData(["announcements", teamId], data);
        }
      }
    },
    onSuccess: () => {
      form.reset();
      setSelectedTeams([]);
      toastAnnouncement("success", "Announcement sent!");
      // Invalidation happens in onSettled now
    },
    onSettled: (data, error, variables) => {
      // Always invalidate after success or error when optimistic updates are enabled
      queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
      // Invalidate specific teams involved in the mutation
      if (variables?.teamIds) {
         for (const teamId of variables.teamIds) {
           queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
         }
      } else {
         // If no specific teams, maybe invalidate all announcement queries more broadly?
         // Or rely on the 'all' invalidation. For now, just invalidate 'all' and specific ones if provided.
         queryClient.invalidateQueries({ queryKey: ["announcements"] }); // Broader invalidation if needed
      }
    },
  });

  useEffect(() => {
    async function loadTeams() {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/teams");
          if (!res.ok) throw new Error("Failed to fetch teams");
          const { teams } = await res.json();
          setTeams(teams);
        } catch (e) {
          setError("Failed to load teams");
        }
      }
    }
    loadTeams();
  }, [session?.user?.id]);

  if (!validRoles.includes(role)) return null;

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const onSubmit = (values: AnnouncementFormValues) => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return;
    }
    setError(null);
    mutation.mutate({
      content: values.content,
      priority: values.priority,
      teamIds: selectedTeams,
      senderId: session.user.id,
      senderRole: role,
    });
  };

  return (
    <div className="w-full max-w-2xl p-4 space-y-6 border rounded-lg bg-card shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Content Textarea */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Announcement Message</FormLabel>
                <FormControl>
                  <Textarea // Use Textarea component
                    placeholder="Write your announcement..."
                    maxLength={300}
                    disabled={mutation.isPending}
                    {...field}
                    className="min-h-[80px] resize-y" // Increased min-height, allow vertical resize
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
            {/* Priority Select */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="w-full sm:w-[150px]">
                  <FormLabel>Priority</FormLabel> {/* Made label visible */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AnnouncementPriority.NORMAL}>
                        Normal
                      </SelectItem>
                      <SelectItem value={AnnouncementPriority.HIGH}>
                        High
                      </SelectItem>
                      <SelectItem value={AnnouncementPriority.URGENT}>
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full sm:w-auto" // Adjust width for responsiveness
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Announcement"
              )}
            </Button>
          </div>

          {/* Team Selection - Always Visible */}
          <div className="space-y-3 pt-4 border-t">
            <FormLabel className="font-medium">Target Teams (Optional - Defaults to all your teams)</FormLabel>
            <div className="flex flex-wrap gap-3">
              {teams.length === 0 && !mutation.isPending && (
                <p className="text-sm text-muted-foreground">No teams found or loading...</p>
              )}
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-background text-sm hover:bg-muted/50 transition-colors" // Removed cursor-pointer
                  // onClick removed from div
                >
                  <Checkbox
                    checked={selectedTeams.includes(team.id)}
                    onCheckedChange={() => handleTeamToggle(team.id)} // Restored onCheckedChange
                    id={`team-${team.id}`}
                    disabled={mutation.isPending}
                    aria-label={`Select team ${team.name}`}
                    // className="pointer-events-none" removed
                  />
                  <label
                    htmlFor={`team-${team.id}`} // Still useful for accessibility
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer" // Added cursor-pointer back to label
                  >
                    {team.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {(error || mutation.error) && (
            <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
              <strong>Error:</strong> {error || (mutation.error as Error)?.message}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
