"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import TanStack Query hooks
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"; // Added Card components
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useSession } from "~/lib/auth-client";

// Define the shape of a single announcement for optimistic update
interface Announcement {
  id: string; // Temporary ID for optimistic update
  content: string;
  createdAt: string;
  teamId: string; // Use 'all' or specific ID
  teamName: string; // Need to determine this or leave blank
  sender: {
    name: string | null;
    image?: string | null;
  };
}

// Define the structure for query data (matching useInfiniteQuery in list client)
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
  // teamIds is handled by selectedTeams state, not part of RHF schema directly for submission
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

// Define the mutation function
const createAnnouncement = async (variables: {
  content: string;
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
    const errorData = await res.json().catch(() => ({})); // Try to parse error
    throw new Error(
      errorData.message || "Failed to create announcement. Please try again.",
    );
  }
  return res.json(); // Return the created announcement data if needed
};

export function AnnouncementForm() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null); // Keep local error for non-mutation errors
  const queryClient = useQueryClient(); // Get query client

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const validRoles = ["teacher", "admin", "staff"];
  const role = session?.user?.role as string;

  // Use useMutation for creating announcements
  const mutation = useMutation({
    mutationFn: createAnnouncement,
    onMutate: async (newAnnouncementData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      // Snapshot the previous value for all relevant queries
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
        .filter((item) => item.data); // Filter out teams not currently cached

      // Optimistically update to the new value
      const optimisticAnnouncement: Announcement = {
        id: `optimistic-${Date.now()}`,
        content: newAnnouncementData.content,
        createdAt: new Date().toISOString(),
        teamId: "", // Placeholder, actual team association happens server-side
        teamName: "", // Placeholder
        sender: {
          name: session?.user.name ?? "You",
          image: session?.user.image ?? null,
        },
      };

      // Update 'all' query cache
      queryClient.setQueryData<InfiniteQueryData>(
        ["announcements", "all"],
        (oldData) => {
          if (!oldData) return oldData;
          const newData = { ...oldData };
          // Add to the beginning of the first page
          newData.pages = [...newData.pages];
          newData.pages[0] = {
            ...newData.pages[0],
            announcements: [
              optimisticAnnouncement,
              ...newData.pages[0].announcements,
            ],
          };
          return newData;
        },
      );

      // Update specific team query caches
      for (const teamId of newAnnouncementData.teamIds) {
        queryClient.setQueryData<InfiniteQueryData>(
          ["announcements", teamId],
          (oldData) => {
            if (!oldData) return oldData;
            const newData = { ...oldData };
            newData.pages = [...newData.pages];
            newData.pages[0] = {
              ...newData.pages[0],
              announcements: [
                optimisticAnnouncement,
                ...newData.pages[0].announcements,
              ],
            };
            return newData;
          },
        );
      }

      // Return a context object with the snapshotted value
      return {
        previousAnnouncementsAll,
        previousAnnouncementsSelected,
      };
    },
    onError: (err, newAnnouncement, context) => {
      setError((err as Error).message || "Failed to send announcement.");
      toastAnnouncement("error", "Failed to send announcement.");
      // Rollback on error
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
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["announcements", "all"] });
      for (const teamId of variables.teamIds) {
        queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
      }
    },
  });

  useEffect(() => {
    async function loadTeams() {
      if (session?.user?.id) {
        try {
          // Consider using TanStack Query for fetching teams too for consistency
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

  // Check role *after* all hooks have been called
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
      teamIds: selectedTeams, // Use state for selected teams
      senderId: session.user.id,
      senderRole: role,
    });
  };

  return (
    <div className="w-full md:w-2xl p-4 space-y-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Create Announcement</h2>
      <p className="text-sm text-muted-foreground">
        Send a message to selected teams or all teams.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Announcement Message</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Write your announcement..."
                      maxLength={300}
                      disabled={mutation.isPending} // Use mutation pending state
                      {...field}
                      className="flex-grow min-h-[40px]"
                    />
                    <Button
                      type="submit"
                      disabled={mutation.isPending} // Use mutation pending state
                      className="shrink-0"
                    >
                      {mutation.isPending ? "Sending..." : "Send"}{" "}
                      {/* Use mutation pending state */}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
              Select Teams (optional, defaults to all)
            </summary>
            <div className="mt-2 space-y-2 pt-2 border-t">
              <div className="flex flex-wrap gap-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-2 p-2 border rounded-md bg-muted/20 text-sm"
                  >
                    <Checkbox
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                      id={`team-${team.id}`}
                      disabled={mutation.isPending} // Use mutation pending state
                    />
                    <label
                      htmlFor={`team-${team.id}`}
                      className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {team.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </details>

          {(error || mutation.error) && ( // Display local or mutation error
            <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded-md">
              {error || (mutation.error as Error)?.message}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
