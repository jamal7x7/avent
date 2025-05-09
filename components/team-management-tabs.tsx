"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InviteCodeHistory } from "~/components/invite-code-history";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { Team } from "~/types";

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
  abbreviation: z
    .string()
    .max(10, { message: "Abbreviation cannot exceed 10 characters." })
    .optional(), // Added optional abbreviation field
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

export function TeamManagementTabs({
  teams,
  onTeamAdded,
  activeTab = "create-team",
}: {
  teams: Team[];
  onTeamAdded?: () => void;
  activeTab?: "create-team" | "invite-codes";
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
      abbreviation: "", // Added default for abbreviation
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
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          abbreviation: values.abbreviation,
        }), // Added abbreviation to payload
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

  // When used within a tab, we don't need the outer container and title
  return (
    <div className="w-full">
      <Tabs defaultValue={activeTab} className="w-full">
        {/* Hide the tabs when used within the main page tabs */}
        <div className="hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create-team">Create New Team</TabsTrigger>
            <TabsTrigger value="invite-codes">Invite Codes</TabsTrigger>
          </TabsList>
        </div>

        {/* Create Team Tab */}
        <TabsContent value="create-team" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Create New Team
              </CardTitle>
              <CardDescription>
                Set up a new team for your students to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createTeamForm}>
                <form
                  onSubmit={createTeamForm.handleSubmit(handleCreateTeam)}
                  className="space-y-6"
                >
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
                      name="abbreviation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Abbreviation (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter team abbreviation (e.g., TC, 1A)"
                              maxLength={10}
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
                        <FormItem className="space-y-3">
                          <FormLabel>Team Type</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {TEAM_TYPES.map((type) => {
                                const isSelected = field.value === type.value;
                                return (
                                  <div
                                    key={type.value}
                                    className={cn(
                                      "relative flex flex-col items-center justify-center rounded-md border-2 p-4 transition-all cursor-pointer shadow-sm",
                                      isSelected
                                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                                        : "border-muted hover:border-primary/50 hover:bg-accent hover:shadow",
                                      isCreatingTeam &&
                                        "opacity-50 cursor-not-allowed",
                                    )}
                                    onClick={() => {
                                      if (!isCreatingTeam) {
                                        field.onChange(type.value);
                                      }
                                    }}
                                  >
                                    {/* Team Type Icon */}
                                    <div className="mb-3 text-3xl text-primary p-2 bg-primary/5 rounded-full">
                                      {type.value === "classroom" && (
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                        </svg>
                                      )}
                                      {type.value === "study_group" && (
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                          <circle cx="9" cy="7" r="4" />
                                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                      )}
                                      {type.value === "club" && (
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
                                          <path d="m18 2 4 4-4 4" />
                                          <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
                                          <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
                                          <path d="m18 14 4 4-4 4" />
                                        </svg>
                                      )}
                                      {type.value === "committee" && (
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <rect
                                            width="18"
                                            height="18"
                                            x="3"
                                            y="3"
                                            rx="2"
                                          />
                                          <path d="M7 7h10" />
                                          <path d="M7 12h10" />
                                          <path d="M7 17h10" />
                                        </svg>
                                      )}
                                      {type.value === "other" && (
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <circle cx="12" cy="12" r="10" />
                                          <path d="M12 16v.01" />
                                          <path d="M12 8a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 2-2.8 3" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className="font-semibold text-sm mt-1 bg-primary/5 px-3 py-1 rounded-full">
                                      {type.label}
                                    </span>
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-white rounded-full flex items-center justify-center">
                                        <svg
                                          role="graphics-symbol img"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </FormControl>
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

                  <Button
                    type="submit"
                    disabled={isCreatingTeam}
                    className="w-full"
                  >
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Codes Tab */}
        <TabsContent value="invite-codes" className="mt-4 space-y-6">
          <Card className="border-2 border-muted/50 hover:border-primary/20 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <svg
                  role="graphics-symbol img"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                Generate Invite Code
              </CardTitle>
              <CardDescription className="text-base">
                Create a shareable invite code for students to join your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generateCodeForm}>
                <form
                  onSubmit={generateCodeForm.handleSubmit(
                    handleGenerateCodeSubmit,
                  )}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={generateCodeForm.control}
                      name="teamId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">
                            Select Team
                          </FormLabel>
                          <Dialog>
                            <DialogTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-11 justify-start gap-2 px-3 w-full text-left font-normal transition-all",
                                    !field.value
                                      ? "text-muted-foreground"
                                      : "border-solid bg-primary/5 hover:bg-primary/10",
                                  )}
                                  disabled={isGeneratingCode}
                                >
                                  {field.value ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={`https://avatar.vercel.sh/${teams.find((t) => t.id === field.value)?.name || "team"}.png`}
                                          alt={
                                            teams.find(
                                              (t) => t.id === field.value,
                                            )?.name || "Team"
                                          }
                                        />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                          {(
                                            teams.find(
                                              (t) => t.id === field.value,
                                            )?.name || "T"
                                          )
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-base">
                                        {teams.find((t) => t.id === field.value)
                                          ?.name || "Select a team"}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>Select a team</span>
                                  )}
                                </Button>
                              </FormControl>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Select Team</DialogTitle>
                                <DialogDescription>
                                  Choose which team to generate an invite code
                                  for
                                </DialogDescription>
                              </DialogHeader>

                              <div className="max-h-[300px] space-y-1 overflow-y-auto py-2 pr-2 divide-y divide-border">
                                {teams.length > 0 ? (
                                  teams.map((team) => (
                                    <div
                                      key={team.id}
                                      className={cn(
                                        "flex items-center space-x-3 rounded-md py-2 px-1 hover:bg-accent transition-colors cursor-pointer",
                                        field.value === team.id &&
                                          "bg-primary/5",
                                      )}
                                      onClick={() => field.onChange(team.id)}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={`https://avatar.vercel.sh/${team.name}.png`}
                                            alt={team.name}
                                          />
                                          <AvatarFallback className="text-xs">
                                            {team.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <label className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                          {team.name}
                                        </label>
                                      </div>
                                      {field.value === team.id && (
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
                                          className="text-primary"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                      No teams available
                                    </p>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button">Done</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <FormMessage className="text-sm font-medium" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generateCodeForm.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-medium">
                            Expiration Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`h-11 w-full pl-3 text-left font-normal text-base ${!field.value && "text-muted-foreground"}`}
                                  disabled={isGeneratingCode}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-sm font-medium" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generateCodeForm.control}
                      name="maxUses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Max Uses
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              min={1}
                              max={1000}
                              disabled={isGeneratingCode}
                              className="h-11 text-base"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-sm font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {inviteCode && (
                    <div className="p-5 mt-2 rounded-lg bg-primary/5 border-2 border-primary/10 shadow-sm">
                      <div className="flex flex-col space-y-3">
                        <p className="text-base font-medium flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Your Invite Code is Ready
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <code className="flex-1 p-3 rounded-md bg-background font-mono text-xl font-bold tracking-wider text-center sm:text-left">
                            {inviteCode}
                          </code>
                          <Button
                            type="button"
                            variant="default"
                            size="default"
                            className="w-full sm:w-auto flex items-center gap-2"
                            onClick={() => {
                              navigator.clipboard.writeText(inviteCode);
                              toastAnnouncement(
                                "success",
                                "Code copied to clipboard!",
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                width="14"
                                height="14"
                                x="8"
                                y="8"
                                rx="2"
                                ry="2"
                              />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            Copy Code
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Share this code with your students to allow them to
                          join your team.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isGeneratingCode}
                    className="w-full h-11 text-base font-medium mt-2"
                    size="lg"
                  >
                    {isGeneratingCode ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        Generate Invite Code
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Invite Code History */}
          <InviteCodeHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
