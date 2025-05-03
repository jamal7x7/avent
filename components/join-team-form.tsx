"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { joinTeamWithCode } from "~/app/dashboard/team-management/actions"; // Import the server action
import { toastAnnouncement } from "~/components/toast-announcement";
import { Button } from "~/components/ui/button";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp"; // Import InputOTP

const joinTeamFormSchema = z.object({
  code: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type JoinTeamFormValues = z.infer<typeof joinTeamFormSchema>;

export function JoinTeamForm({ onJoined }: { onJoined?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleJoin = (values: JoinTeamFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        // Directly call the server action
        const result = await joinTeamWithCode({
          code: values.code.trim().toUpperCase(),
          // userId will be handled within the action using auth
        });

        if (result.error) {
          throw new Error(result.error);
        }

        form.reset();
        toastAnnouncement("success", "Successfully joined team!");
        if (onJoined) onJoined();
      } catch (e) {
        const errorMessage = (e as Error).message || "Failed to join team.";
        setError(errorMessage);
        toastAnnouncement("error", errorMessage);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleJoin)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Invite Code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field} disabled={isPending}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  {/* Optional: Add a separator if desired */}
                  {/* <InputOTPSeparator /> */}
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the 6-character invite code provided by your team
                admin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isPending || form.watch("code").length !== 6}
        >
          {isPending ? "Joining..." : "Join Team"}
        </Button>
      </form>
    </Form>
  );
}
