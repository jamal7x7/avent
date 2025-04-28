"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toastAnnouncement } from "~/components/toast-announcement";
import { useSession } from "~/lib/auth-client";
import { format } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";


const TEAM_TYPES = [
  { value: "classroom", label: "Classroom" },
  { value: "study_group", label: "Study Group" },
  { value: "club", label: "Club" },
  { value: "committee", label: "Committee" },
  { value: "other", label: "Other" },
];

const createTeamFormSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }).max(100, { message: "Team name cannot exceed 100 characters." }),
  type: z.enum(["classroom", "study_group", "club", "committee", "other"]),
});

type CreateTeamFormValues = z.infer<typeof createTeamFormSchema>;

const generateCodeFormSchema = z.object({
  teamId: z.string().min(1, { message: "Please select a team." }),
  expiresAt: z.date({
    required_error: "Expiration date is required.",
  }),
  maxUses: z.number().min(1, { message: "Max uses must be at least 1." }).max(1000, { message: "Max uses cannot exceed 1000." }),
});

type GenerateCodeFormValues = z.infer<typeof generateCodeFormSchema>;


export function AddTeamForm({ teams, onTeamAdded }: { teams: { id: string; name: string; type: string }[]; onTeamAdded?: () => void }) {
  const { data: session } = useSession();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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


  const isTeacher = ["teacher", "admin", "staff"].includes(session?.user?.role ?? "");

  // Handler to create a new team (server action or API call)
  const handleCreateTeam = async (values: CreateTeamFormValues) => {
    setError(null);
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
        `Team created: ${values.name} (${TEAM_TYPES.find(t => t.value === values.type)?.label || values.type})`
      );
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to create team.");
    }
  };

  // Handler to generate invite code for selected team
  const handleGenerateCodeSubmit = async (values: GenerateCodeFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: values.teamId,
          expiresAt: values.expiresAt.toISOString(),
          maxUses: values.maxUses
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setInviteCode(data.code.code);
      toastAnnouncement("success", "Invite code generated!");
    } catch (e) {
      setError((e as Error).message);
      toastAnnouncement("error", "Failed to generate code.");
    }
  };

  if (!isTeacher) return null;

  return (
    <div className="space-y-8">
      <Form {...createTeamForm}>
        <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4 p-4 border rounded bg-card">
          <h2 className="text-lg font-semibold">Add Team</h2>
          <FormField
            control={createTeamForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="Team Name" maxLength={100} disabled={createTeamForm.formState.isSubmitting} {...field} />
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
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={createTeamForm.formState.isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEAM_TYPES.map(t => (
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={createTeamForm.formState.isSubmitting}>Create Team</Button>
        </form>
      </Form>

      <Form {...generateCodeForm}>
        <form onSubmit={generateCodeForm.handleSubmit(handleGenerateCodeSubmit)} className="space-y-4 p-4 border rounded bg-card">
          <h2 className="text-lg font-semibold">Generate Invite Code</h2>
          <FormField
            control={generateCodeForm.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Team</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={generateCodeForm.formState.isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map(t => (
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
                        className={`w-[240px] pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        disabled={generateCodeForm.formState.isSubmitting}
                      >
                        {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                        {/* You might need to add a time picker component or input */}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    {/* Add a time input here */}
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
                  <Input type="number" placeholder="10" min={1} max={1000} disabled={generateCodeForm.formState.isSubmitting} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {inviteCode && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-lg font-bold">{inviteCode}</span>
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(inviteCode)}>Copy</Button>
            </div>
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={generateCodeForm.formState.isSubmitting}>{generateCodeForm.formState.isSubmitting ? "Generating..." : "Generate Code"}</Button>
        </form>
      </Form>
    </div>
  );
}
