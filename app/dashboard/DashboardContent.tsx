"use client";

import React from "react";
import { useNavLayoutStore } from "~/hooks/use-nav-layout";
import clsx from "clsx";
import { AppSidebar, data as sidebarData } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import FeedbackDialog from "~/components/feedback-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { RiScanLine } from "@remixicon/react";
import { Button } from "~/components/ui/button";
import { StatsGrid } from "~/components/stats-grid";
import ContactsTable from "~/components/contacts-table";
import { AuthAvatar } from "~/components/auth-avatar";
import { useSession, signOut } from "~/lib/auth-client";
import { TeamSwitcher } from "~/components/team-switcher";

import type { Metadata } from "next";

export {
  Button,
  StatsGrid,
  ContactsTable,
};

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardContent({ children }: { children?: React.ReactNode }) {
  const { isSidebar } = useNavLayoutStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // Sidebar width utility (matches sidebar.tsx)
  const SIDEBAR_WIDTH = "16rem";
  React.useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (!sidebar) return;
    const sidebarCollapsible = sidebar.closest('[data-collapsible]');
    if (!sidebarCollapsible) return;
    const observer = new MutationObserver(() => {
      setIsCollapsed(sidebarCollapsible.getAttribute('data-collapsible') === 'icon');
    });
    observer.observe(sidebarCollapsible, { attributes: true });
    setIsCollapsed(sidebarCollapsible.getAttribute('data-collapsible') === 'icon');
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <AppSidebar />
      <SidebarInset
        className={clsx(
          "overflow-hidden px-4 md:px-6 lg:px-8",
          isSidebar ? "mt-0" : "mt-16"
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
            <Separator
              orientation="vertical"
              decorative
              className="mx-2 h-8"
            />
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
        </header>
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}
