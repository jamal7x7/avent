"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSession } from "~/lib/auth-client";

const TEAM_TYPES = [
  { value: "classroom", label: "Classroom" },
  { value: "study_group", label: "Study Group" },
  { value: "club", label: "Club" },
  { value: "committee", label: "Committee" },
  { value: "other", label: "Other" },
];

const createTeamFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Team name is required" })
    .max(100, { message: "Team name cannot exceed 100 characters." }),
  type: z.enum(["classroom", "study_group", "club", "committee", "other"]),
});

type CreateTeamFormValues = z.infer<typeof createTeamFormSchema>;

const generateCodeFormSchema = z.object({
  teamId: z.string().min(1, { message: "Please select a team." }),
  expiresAt: z.date({
    required_error: "Expiration date is required.",
  }),
  maxUses: z
    .number()
    .min(1, { message: "Max uses must be at least 1." })
    .max(1000, { message: "Max uses cannot exceed 1000." }),
});

type GenerateCodeFormValues = z.infer<typeof generateCodeFormSchema>;

export function AddTeamForm({
  teams,
  onTeamAdded,
}: {
  teams: { id: string; name: string; type: string }[];
  onTeamAdded?: () => void;
}) {
  const { data: session } = useSession();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const createTeamForm = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: {
      name: "",
      type: "classroom",
    },
  });

  const generateCodeForm = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(generateCodeFormSchema),
    defaultValues: {
      teamId: "",
      expiresAt: undefined,
      maxUses: 10,
    },
  });

  const isTeacher = ["teacher", "admin", "staff"].includes(
    session?.user?.role ?? "",
  );

  const handleCreateTeam = async (values: CreateTeamFormValues) => {
    setError(null);
    setIsCreatingTeam(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, type: values.type }),
      });
      if (!res.ok) throw new Error("Failed to create team");
      createTeamForm.reset();
      if (onTeamAdded) onTeamAdded();
      toastAnnouncement(
        "success",
        `Team created: ${values.name} (${TEAM_TYPES.find((t) => t.value === values.type)?.label || values.type})`,
      );
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to create team.");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleGenerateCodeSubmit = async (values: GenerateCodeFormValues) => {
    setError(null);
    setIsGeneratingCode(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: values.teamId,
          expiresAt: values.expiresAt.toISOString(),
          maxUses: values.maxUses,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setInviteCode(data.code.code);
      toastAnnouncement("success", "Invite code generated!");
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to generate code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  if (!isTeacher) return null;

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
        <p className="text-muted-foreground">
          Create new teams and generate invite codes for your students.
        </p>
      </div>

      <Form {...createTeamForm}>
        <form
          onSubmit={createTeamForm.handleSubmit(handleCreateTeam)}
          className="space-y-6 p-6 border rounded-lg bg-card shadow-sm"
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Create New Team</h3>
            <p className="text-sm text-muted-foreground">
              Set up a new team for your students to join.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={createTeamForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter team name"
                      maxLength={100}
                      disabled={isCreatingTeam}
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createTeamForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isCreatingTeam}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a team type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isCreatingTeam} className="w-full">
            {isCreatingTeam ? (
              <>
                <span className="mr-2">Creating...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              "Create Team"
            )}
          </Button>
        </form>
      </Form>

      <Form {...generateCodeForm}>
        <form
          onSubmit={generateCodeForm.handleSubmit(handleGenerateCodeSubmit)}
          className="space-y-6 p-6 border rounded-lg bg-card shadow-sm"
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Generate Invite Code</h3>
            <p className="text-sm text-muted-foreground">
              Create an invite code for students to join an existing team.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={generateCodeForm.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Team</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isGeneratingCode}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generateCodeForm.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`h-10 w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          disabled={isGeneratingCode}
                        >
                          {field.value ? (
                            format(field.value, "PPP HH:mm")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generateCodeForm.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Uses</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      min={1}
                      max={1000}
                      disabled={isGeneratingCode}
                      className="h-10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {inviteCode && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Invite Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-background font-mono text-lg font-bold">
                    {inviteCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      toastAnnouncement("success", "Code copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isGeneratingCode} className="w-full">
            {isGeneratingCode ? (
              <>
                <span className="mr-2">Generating...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              "Generate Code"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
