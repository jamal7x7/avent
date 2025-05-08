import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { auth } from "~/lib/auth";

export default async function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the user session to check permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Validate user role (only teachers, admins, staff can view scheduled announcements)
  const validRoles = ["teacher", "admin", "staff"];
  const hasAccess = session.user.role && validRoles.includes(session.user.role);

  return <div className="space-y-6">{children}</div>;
}
