"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toastAnnouncement } from "~/components/toast-announcement";
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

const joinTeamFormSchema = z.object({
  code: z.string().length(6, { message: "Invite code must be 6 characters." }),
});

type JoinTeamFormValues = z.infer<typeof joinTeamFormSchema>;

export function JoinTeamForm({ onJoined }: { onJoined?: () => void }) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleJoin = async (values: JoinTeamFormValues) => {
    setError(null);
    form.formState.isSubmitting = true;
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: values.code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join team");
      form.reset();
      toastAnnouncement("success", "Joined team!");
      if (onJoined) onJoined();
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to join team.");
    } finally {
      form.formState.isSubmitting = false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleJoin)} className="space-y-4 p-4 border rounded bg-card max-w-md w-full">
        <h2 className="text-lg font-semibold">Join Team</h2>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={form.formState.isSubmitting || form.watch("code").length !== 6}>
          {form.formState.isSubmitting ? "Joining..." : "Join Team"}
        </Button>
      </form>
    </Form>
  );
}
