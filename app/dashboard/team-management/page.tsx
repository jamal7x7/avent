import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { PlusIcon, UsersIcon } from "lucide-react";
import { TeamCard } from "~/components/team-card";
import { AddTeamForm } from "~/components/add-team-form";
import { JoinTeamForm } from "~/components/join-team-form";
import { fetchUserTeams } from "~/app/dashboard/announcements/actions";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const teamsRaw = session?.user?.id ? await fetchUserTeams(session.user.id) : [];
  const teams = teamsRaw.map((t: any) => ({ ...t, type: t.type ?? "classroom" }));
  const hasTeams = teams.length > 0;
  return (
    <div className="h-full py-10 px-4">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Team Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <PlusIcon className="w-5 h-5 text-primary" /> Add Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddTeamForm teams={teams} />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <UsersIcon className="w-5 h-5 text-primary" /> Join Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JoinTeamForm />
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-muted-foreground" /> Your Teams
          </h2>
          {hasTeams ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team: any) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8">No teams yet. Create or join a team to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
}
