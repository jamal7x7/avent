"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
      <div className="h-full py-0 px-4 w-full space-y-0">
        {/* <h1 className="text-2xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground mb-6">
          Manage and send announcements to your teams.
        </p> */}

        <Tabs variant="underlined" defaultValue="your-teams" className="w-full">
          <TabsList className="flex justify-start border-b">
            <TabsTrigger value="your-teams">Your Teams</TabsTrigger>
            <TabsTrigger value="add-team">Add Team</TabsTrigger>
            <TabsTrigger value="join-team">Join Team</TabsTrigger>
            <TabsTrigger value="invite-code">Generate Invite Code</TabsTrigger>
          </TabsList>

          {/* Your Teams Tab - Uses the new layout component */}
          <TabsContent value="your-teams" className="mt-4">
            <YourTeamsTabContent teams={teams} hasTeams={hasTeams} />
          </TabsContent>

          {/* Add Team Tab */}
          <TabsContent value="add-team" className="mt-4">
            <Card className="shadow-sm">
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

          {/* Join Team Tab */}
          <TabsContent value="join-team" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Join an Existing Team
                </CardTitle>
                <CardDescription>
                  Enter the invite code provided by your team admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinTeamForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Invite Code Tab */}
          <TabsContent value="invite-code" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Generate Invite Code
                </CardTitle>
                <CardDescription>
                  Create an invite code for students to join your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagementTabs teams={teams} activeTab="invite-codes" />
              </CardContent>
            </Card>

            {/* Invite Code History */}
            <div className="mt-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Invite Code History
                  </CardTitle>
                  <CardDescription>
                    View and manage previously generated invite codes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <InviteCodeHistory />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardContent>
  );
}
