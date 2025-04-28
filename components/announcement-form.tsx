"use client";
import { useState, useEffect } from "react";
import { useSession } from "~/lib/auth-client";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const announcementFormSchema = z.object({
  content: z.string().min(1, { message: "Announcement message cannot be empty." }).max(300, { message: "Announcement message cannot exceed 300 characters." }),
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

  const validRoles = ["teacher","admin","staff"];
  const role = (typeof session?.user?.role === 'string' && validRoles.includes(session.user.role))
    ? session.user.role as "teacher" | "admin" | "staff"
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
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const onSubmit = async (values: AnnouncementFormValues) => {
    setError(null);
    form.formState.isSubmitting = true; // Manually set submitting state for the button
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: values.content,
          teamIds: selectedTeams, // [] means all teams
          senderId: session!.user.id,
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
      form.formState.isSubmitting = false; // Manually set submitting state for the button
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl w-full">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Announcement</FormLabel>
              <FormControl>
                <Input
                  placeholder="Write your announcement..."
                  maxLength={300}
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <span className="font-medium">Send to teams:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {teams.map(team => (
              <label key={team.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTeams.includes(team.id)}
                  onCheckedChange={() => handleTeamToggle(team.id)}
                  id={`team-${team.id}`}
                />
                <span>{team.name}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">No selection = all teams</div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending..." : "Send Announcement"}
        </Button>
      </form>
    </Form>
  );
}
