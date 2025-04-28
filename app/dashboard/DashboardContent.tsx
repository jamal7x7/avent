"use client";

import { RiScanLine } from "@remixicon/react";
import clsx from "clsx";
import React from "react";
import { AppSidebar, data as sidebarData } from "~/components/app-sidebar";
import { AuthAvatar } from "~/components/auth-avatar";
import ContactsTable from "~/components/contacts-table";
import FeedbackDialog from "~/components/feedback-dialog";
import { StatsGrid } from "~/components/stats-grid";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { useNavLayoutStore } from "~/hooks/use-nav-layout";
import { signOut, useSession } from "~/lib/auth-client";

import type { Metadata } from "next";
import {
  SimpleTabs,
  SimpleTabsContent,
  SimpleTabsList,
  SimpleTabsTrigger,
} from "~/components/ui/simple-tabs";

export { Button, StatsGrid, ContactsTable };

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardContent({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isSidebar } = useNavLayoutStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // Sidebar width utility (matches sidebar.tsx)
  const SIDEBAR_WIDTH = "16rem";
  React.useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (!sidebar) return;
    const sidebarCollapsible = sidebar.closest("[data-collapsible]");
    if (!sidebarCollapsible) return;
    const observer = new MutationObserver(() => {
      setIsCollapsed(
        sidebarCollapsible.getAttribute("data-collapsible") === "icon",
      );
    });
    observer.observe(sidebarCollapsible, { attributes: true });
    setIsCollapsed(
      sidebarCollapsible.getAttribute("data-collapsible") === "icon",
    );
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset
        className={clsx(
          "flex-1 w-full overflow-hidden px-4 md:px-6 lg:px-8",
          isSidebar ? "mt-0" : "mt-16",
        )}
      >
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ms-4" />
            {/* Insert TeamSwitcher in icon mode */}
            {isCollapsed && (
              <div style={{ width: SIDEBAR_WIDTH }}>
                <TeamSwitcher teams={sidebarData.teams} />
              </div>
            )}
            <Separator orientation="vertical" decorative className="mx-2 h-8" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    <RiScanLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* <div className="flex gap-3 ml-auto">
            <FeedbackDialog />
            <AuthAvatar
              name={session?.user?.name || "User"}
              email={session?.user?.email || ""}
              image={session?.user?.image || undefined}
              isDashboard={true}
            />
          </div> */}
          {/* <SimpleTabs defaultValue="your-teams" className="w-full">
            <SimpleTabsList className="flex justify-start border-b">
              <SimpleTabsTrigger value="your-teams">
                Your Teams
              </SimpleTabsTrigger>
              <SimpleTabsTrigger value="add-team">Add Team</SimpleTabsTrigger>
              <SimpleTabsTrigger value="join-team">Join Team</SimpleTabsTrigger>
            </SimpleTabsList>
          </SimpleTabs> */}
        </header>
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-2 lg:py-4">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
