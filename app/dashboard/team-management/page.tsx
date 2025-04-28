import { headers } from "next/headers";
import { fetchUserTeams } from "~/app/dashboard/announcements/actions";
import { AddTeamForm } from "~/components/add-team-form";
import { AnnouncementForm } from "~/components/announcement-form";
import AnnouncementList from "~/components/announcement-list";
import { JoinTeamForm } from "~/components/join-team-form";
import { TeamCard } from "~/components/team-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  SimpleTabs,
  SimpleTabsContent,
  SimpleTabsList,
  SimpleTabsTrigger,
} from "~/components/ui/simple-tabs"; // Import SimpleTabs component
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
      <div className="h-full py-10 px-4 space-y-8">
        <h1 className="text-2xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground mb-6">
          Manage and send announcements to your teams.
        </p>

      <SimpleTabs defaultValue="your-teams" className="w-full">
        <SimpleTabsList className="flex justify-start border-b">
          <SimpleTabsTrigger value="your-teams">Your Teams</SimpleTabsTrigger>
          <SimpleTabsTrigger value="add-team">Add Team</SimpleTabsTrigger>
          <SimpleTabsTrigger value="join-team">Join Team</SimpleTabsTrigger>
        </SimpleTabsList>

        {/* Your Teams Tab */}
        <SimpleTabsContent value="your-teams" className="mt-4">
          {hasTeams ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              No teams yet. Create or join a team using the tabs above.
            </div>
          )}
        </SimpleTabsContent>

        {/* Add Team Tab */}
        <SimpleTabsContent value="add-team" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Create a New Team</CardTitle>
            </CardHeader>
            <CardContent>
              <AddTeamForm teams={teams} />
            </CardContent>
          </Card>
        </SimpleTabsContent>

        {/* Join Team Tab */}
        <SimpleTabsContent value="join-team" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Join an Existing Team</CardTitle>
            </CardHeader>
            <CardContent>
              <JoinTeamForm />
            </CardContent>
          </Card>
        </SimpleTabsContent>
      </SimpleTabs>
      </div>
    </DashboardContent>
  );
}
