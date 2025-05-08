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
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">
                Team Invite Code
              </FormLabel>
              <FormDescription className="text-sm">
                Enter the 6-character code provided by your team administrator.
              </FormDescription>
              <FormControl>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg border border-muted shadow-sm hover:shadow-md transition-all duration-300">
                  <InputOTP
                    size={36}
                    maxLength={6}
                    {...field}
                    disabled={isPending || success}
                    className="gap-2 transition-all duration-200"
                  >
                    <InputOTPGroup className="space-x-2 p-3 sm:space-x-3">
                      <InputOTPSlot
                        index={0}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                      <InputOTPSlot
                        index={1}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                      <InputOTPSlot
                        index={2}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                    </InputOTPGroup>
                    {/* <InputOTPSeparator /> */}
                    <InputOTPGroup className="space-x-2 sm:space-x-3">
                      <InputOTPSlot
                        index={3}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                      <InputOTPSlot
                        index={4}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                      <InputOTPSlot
                        index={5}
                        className="rounded-md border-l border-primary/30 h-12 w-12 text-lg font-medium transition-all duration-200 focus:scale-105 focus:border-primary"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage className="text-sm font-medium" />
            </FormItem>
          )}
        />

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 shadow-sm">
            <svg
              role="graphics-symbol img"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alert-circle shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-md bg-green-100 text-green-800 text-sm border border-green-200 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 shadow-sm">
            <svg
              role="graphics-symbol img"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-circle shrink-0"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>
              Successfully joined team! You can now view it in the "Your Teams"
              tab.
            </span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || success || form.watch("code").length !== 6}
          className="w-full transition-all duration-200"
        >
          {isPending ? (
            <>
              <span className="mr-2">Joining</span>
              <svg
                role="graphics-symbol img"
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </>
          ) : success ? (
            <>
              <svg
                role="graphics-symbol img"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Joined Successfully</span>
            </>
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
