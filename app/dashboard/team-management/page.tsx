"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClipboardCopyIcon,
  Clock,
  LogOutIcon,
  Plus,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { InviteCodeHistory } from "~/components/invite-code-history";
import { JoinTeamForm } from "~/components/join-team-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/primitives/tabs";
import { TeamManagementTabs } from "~/components/team-management-tabs";
import { toastAnnouncement } from "~/components/toast-announcement";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { YourTeamsTabContent } from "~/components/your-teams-tab-content";
import { useSession } from "~/lib/auth-client";
import DashboardContent from "../DashboardContent";

const TEAM_TYPES = [
  { value: "classroom", label: "Classroom" },
  { value: "club", label: "Club" },
  { value: "department", label: "Department" },
  { value: "other", label: "Other" },
];

const createTeamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  type: z.string(),
});

type CreateTeamFormValues = z.infer<typeof createTeamFormSchema>;

export default function TeamManagementPage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<
    { id: string; name: string; type: string; memberCount: number }[]
  >([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTeams = teams.length > 0;

  const createTeamForm = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: {
      name: "",
      type: "classroom",
    },
  });

  // Fetch teams when session changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/teams?userId=${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch teams");
        const data = await response.json();
        setTeams(
          data.teams.map((t: any) => ({
            id: t.id,
            name: t.name ?? "Unnamed Team",
            type: t.type ?? "classroom",
            memberCount: t.memberCount ?? 0,
          })),
        );
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, [session?.user?.id]);

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

      // Refresh teams list
      if (session?.user?.id) {
        const response = await fetch(`/api/teams?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTeams(
            data.teams.map((t: any) => ({
              id: t.id,
              name: t.name ?? "Unnamed Team",
              type: t.type ?? "classroom",
              memberCount: t.memberCount ?? 0,
            })),
          );
        }
      }

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

  return (
    <DashboardContent>
      <div className="h-full py-0 px-4 w-full space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Create, join, and manage your teams in one place.
          </p>
        </div>

        <Tabs variant="underlined" defaultValue="your-teams" className="w-full">
          <TabsList className="flex justify-start border-b gap-2">
            <TabsTrigger value="your-teams" className="font-medium">
              Your Teams
            </TabsTrigger>
            <TabsTrigger value="add-team" className="font-medium">
              Add Team
            </TabsTrigger>
            <TabsTrigger value="join-team" className="font-medium">
              Join Team
            </TabsTrigger>
            <TabsTrigger value="invite-code" className="font-medium">
              Generate Invite Code
            </TabsTrigger>
          </TabsList>

          {/* Your Teams Tab - Uses the new layout component */}
          <TabsContent value="your-teams" className="mt-4">
            {!hasTeams ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-muted/20">
                <div className="flex flex-col items-center text-center max-w-md space-y-4">
                  <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold">No teams yet</h3>
                  <p className="text-muted-foreground">
                    You haven't created or joined any teams yet. Create a new
                    team or join an existing one using the tabs above.
                  </p>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document
                          .querySelector('[value="add-team"]')
                          ?.dispatchEvent(
                            new MouseEvent("click", { bubbles: true }),
                          )
                      }
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Team
                    </Button>
                    <Button
                      variant="default"
                      onClick={() =>
                        document
                          .querySelector('[value="join-team"]')
                          ?.dispatchEvent(
                            new MouseEvent("click", { bubbles: true }),
                          )
                      }
                      className="flex items-center gap-2"
                    >
                      <LogOutIcon className="h-4 w-4 rotate-180" />
                      Join Team
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border-2 border-muted/50 shadow-sm overflow-hidden">
                <YourTeamsTabContent teams={teams} hasTeams={hasTeams} />
              </div>
            )}
          </TabsContent>

          {/* Add Team Tab */}
          <TabsContent value="add-team" className="mt-4">
            <Card className="shadow-sm border-2 border-muted/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create New Team
                </CardTitle>
                <CardDescription className="text-base">
                  Set up a new team for your students to join.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...createTeamForm}>
                  <form
                    onSubmit={createTeamForm.handleSubmit(handleCreateTeam)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6">
                      <FormField
                        control={createTeamForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Team Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter team name (e.g., Math 101, Science Club)"
                                maxLength={100}
                                disabled={isCreatingTeam}
                                className="h-11 text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createTeamForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Team Type
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isCreatingTeam}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 text-base">
                                  <SelectValue placeholder="Select a team type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TEAM_TYPES.map((t) => (
                                  <SelectItem
                                    key={t.value}
                                    value={t.value}
                                    className="text-base"
                                  >
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-sm font-medium" />
                          </FormItem>
                        )}
                      />
                    </div>

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
                          className="lucide lucide-alert-circle"
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
                      disabled={isCreatingTeam}
                      className="w-full h-11 text-base font-medium"
                      size="lg"
                    >
                      {isCreatingTeam ? (
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
                          Creating Team...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Team
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Join Team Tab */}
          <TabsContent value="join-team" className="mt-4">
            <Card className="shadow-sm border-2 border-muted/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <LogOutIcon className="h-5 w-5 text-primary rotate-180" />
                  Join an Existing Team
                </CardTitle>
                <CardDescription className="text-base">
                  Enter the invite code provided by your team admin to join
                  their team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinTeamForm />
              </CardContent>
            </Card>

            {/* Quick tips for joining teams */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="16" y2="12" />
                  <line x1="12" x2="12.01" y1="8" y2="8" />
                </svg>
                Tips for joining teams
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Ask your team admin for the invite code</li>
                <li>
                  Codes are case-sensitive and expire after their set duration
                </li>
                <li>You can be a member of multiple teams simultaneously</li>
                <li>
                  If you have trouble with a code, contact your team
                  administrator
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Generate Invite Code Tab */}
          <TabsContent value="invite-code" className="mt-4">
            <Card className="shadow-sm border-2 border-muted/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <ClipboardCopyIcon className="h-5 w-5 text-primary" />
                  Generate Invite Code
                </CardTitle>
                <CardDescription className="text-base">
                  Create a shareable invite code for students to join your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagementTabs teams={teams} activeTab="invite-codes" />
              </CardContent>
            </Card>

            {/* Invite Code History */}
            <div className="mt-6">
              <InviteCodeHistory />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardContent>
  );
}
