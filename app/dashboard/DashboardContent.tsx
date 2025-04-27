"use client";

import { useNavLayoutStore } from "~/hooks/use-nav-layout";
import clsx from "clsx";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import FeedbackDialog from "~/components/feedback-dialog";
import UserDropdown from "~/components/user-dropdown";
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
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
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
          <div className="flex gap-3 ml-auto">
            <FeedbackDialog />
            <UserDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}
