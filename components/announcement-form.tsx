"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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

const announcementFormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Announcement message cannot be empty." })
    .max(300, {
      message: "Announcement message cannot exceed 300 characters.",
    }),
  teamIds: z.array(z.string()).optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export function AnnouncementForm() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      content: "",
      teamIds: [],
    },
  });

  const validRoles = ["teacher", "admin", "staff"];
  const role =
    typeof session?.user?.role === "string" &&
    validRoles.includes(session.user.role)
      ? (session.user.role as "teacher" | "admin" | "staff")
      : "teacher";

  if (!validRoles.includes(role)) return null;

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

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const onSubmit = async (values: AnnouncementFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: values.content,
          teamIds: selectedTeams, // [] means all teams
          senderId: session?.user.id,
          senderRole: role,
        }),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      form.reset();
      setSelectedTeams([]);
      toastAnnouncement("success", "Announcement sent!");
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to send announcement.");
    } finally {
      // No need to manually manage isSubmitting with react-hook-form
    }
  };

  return (
    // Removed Card wrapper, added a simple div with padding and max-width
    <div className="w-full lg:w-3xl p-4 space-y-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Create Announcement</h2>
      <p className="text-sm text-muted-foreground">
        Send a message to selected teams or all teams.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Removed CardContent */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Announcement Message</FormLabel>{" "}
                {/* Hide label visually */}
                <FormControl>
                  <div className="flex items-center gap-2">
                    {" "}
                    {/* Flex container for input and button */}
                    <Input
                      placeholder="Write your announcement..."
                      maxLength={300}
                      disabled={form.formState.isSubmitting}
                      {...field}
                      className="flex-grow min-h-[40px]" // Adjusted height
                    />
                    {/* Moved Button next to input */}
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="shrink-0" // Prevent button from shrinking
                    >
                      {form.formState.isSubmitting ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Simplified Team Selection Area */}
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
                      disabled={form.formState.isSubmitting}
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

          {error && (
            <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          {/* Removed CardFooter and redundant Button */}
        </form>
      </Form>
    </div>
  );
}
