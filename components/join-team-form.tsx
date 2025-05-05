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
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleJoin = (values: JoinTeamFormValues) => {
    setError(null);
    setSuccess(false);
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
        setSuccess(true);
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
                <InputOTP
                  size={28}
                  maxLength={6}
                  {...field}
                  disabled={isPending || success}
                >
                  <InputOTPGroup className="space-x-2 p-3">
                    <InputOTPSlot index={0} className="rounded-md border-l " />
                    <InputOTPSlot index={1} className="rounded-md border-l" />
                    <InputOTPSlot index={2} className="rounded-md border-l" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="space-x-2">
                    <InputOTPSlot index={3} className="rounded-md border-l" />
                    <InputOTPSlot index={4} className="rounded-md border-l" />
                    <InputOTPSlot index={5} className="rounded-md border-l" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the 6-character invite code provided by your team
                admin. Codes are case-insensitive.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm">
            Successfully joined team! You can now access team resources.
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || success || form.watch("code").length !== 6}
          className="w-full"
        >
          {isPending ? (
            <>
              <span className="mr-2">Joining...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : success ? (
            "Joined Successfully"
          ) : (
            "Join Team"
          )}
        </Button>

        {form.watch("code").length > 0 && form.watch("code").length < 6 && (
          <p className="text-xs text-muted-foreground text-center">
            Please enter all 6 characters of the invite code
          </p>
        )}
      </form>
    </Form>
  );
}
