import { headers } from "next/headers";
import { fetchUserTeams } from "~/app/dashboard/announcements/actions";
import { AddTeamForm } from "~/components/add-team-form";
import { AnnouncementForm } from "~/components/announcement-form";
import AnnouncementList from "~/components/announcement-list";
import { JoinTeamForm } from "~/components/join-team-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/primitives/tabs"; // Import SimpleTabs component
// import { TeamCard } from "~/components/team-card"; // Replaced by YourTeamsTabContent
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { YourTeamsTabContent } from "~/components/your-teams-tab-content"; // Import the new component
import { auth } from "~/lib/auth";
import DashboardContent from "../DashboardContent";
export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const teamsRaw = session?.user?.id
    ? await fetchUserTeams(session.user.id)
    : [];
  const teams = teamsRaw.map((t) => ({
    id: t.id,
    name: t.name ?? "Unnamed Team",
    type: t.type ?? "classroom",
    memberCount: t.memberCount ?? 0,
  }));
  const hasTeams = teams.length > 0;

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
                  Create a New Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddTeamForm teams={teams} />
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
              </CardHeader>
              <CardContent>
                <JoinTeamForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardContent>
  );
}
