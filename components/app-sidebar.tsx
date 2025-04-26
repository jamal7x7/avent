"use client";

import type * as React from "react";

import {
  RiBardLine,
  RiCodeSSlashLine,
  RiLayoutLeftLine,
  RiLeafLine,
  RiLoginCircleLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiArrowDownSLine,
  RiScanLine,
  RiSettings3Line,
  RiUserFollowLine,
  RemixiconComponentType,
} from "@remixicon/react";
import { SearchForm } from "~/components/search-form";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { useNavLayoutStore } from "~/hooks/use-nav-layout";
import { cn } from "~/lib/utils";


type NavItem = {
  title: string;
  url: string;
  icon: RemixiconComponentType;
  isActive?: boolean;
}
// This is sample data.
const data = {
  teams: [
    {
      name: "InnovaCraft",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
    {
      name: "Acme Corp.",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
    {
      name: "Evil Corp.",
      logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "#",
          icon: RiScanLine,
          isActive: true,
        },
        // {
        //   title: "Insights",
        //   url: "#",
        //   icon: RiBardLine,
        // },
        {
          title: "Contacts",
          url: "#",
          icon: RiUserFollowLine,
          isActive: false,
        },
        // {
        //   title: "Tools",
        //   url: "#",
        //   icon: RiCodeSSlashLine,
        // },
        // {
        //   title: "Integration",
        //   url: "#",
        //   icon: RiLoginCircleLine,
        // },
        // {
        //   title: "Layouts",
        //   url: "#",
        //   icon: RiLayoutLeftLine,
        // },
        // {
        //   title: "Reports",
        //   url: "#",
        //   icon: RiLeafLine,
        // },
      ] as NavItem[],
    },
    {
      title: "Other",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: RiSettings3Line,
        },
        {
          title: "Help Center",
          url: "#",
          icon: RiLeafLine,
        },
      ],
    },
  ],
};

function DashboardTopNav() {
  const { toggleNavLayout } = useNavLayoutStore();
  // Split nav groups for layout logic
  const mainGroups = data.navMain.filter((g) => g.title !== "Other");
  const otherGroup = data.navMain.find((g) => g.title === "Other");
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-sidebar text-sidebar-foreground shadow flex flex-row items-center justify-between px-4 py-2 gap-2 border-b border-border">
      <div className="flex items-center gap-4">
        <button
          aria-label="Show Sidebar"
          className="rounded p-2 hover:bg-sidebar-accent focus:outline-none focus:ring"
          onClick={toggleNavLayout}
        >
          <RiMenuLine className="size-6" />
        </button>
        <TeamSwitcher teams={data.teams} />
        <div className="flex-1 flex flex-wrap gap-4 md:gap-8">
          {mainGroups.map((group) => (
            <div key={group.title} className="flex flex-row items-center gap-2">
              {/* Removed group title for cleaner topnav */}
              <div className="flex flex-row gap-2 md:gap-4">
                {group.items.map((item) => {
                  const isActive = 'isActive' in item && item.isActive;
                  return (
                    <a
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "relative inline-flex flex-col md:flex-row items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      {item.icon && <item.icon className="size-5" aria-hidden="true" />}
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-primary" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* Render only icons for 'Other' group */}
        {otherGroup && otherGroup.items.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className="rounded p-2 hover:bg-sidebar-accent focus:outline-none focus:ring"
            title={item.title}
          >
            {item.icon && <item.icon className="size-6" aria-hidden="true" />}
          </a>
        ))}
        <SearchForm className="hidden md:block" />
        <button
          aria-label="Sign Out"
          className="rounded p-2 hover:bg-sidebar-accent focus:outline-none focus:ring"
        >
          <RiLogoutBoxLine className="size-6 text-muted-foreground/60" />
        </button>
      </div>
    </nav>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isSidebar, toggleNavLayout } = useNavLayoutStore();
  if (!isSidebar) {
    return <DashboardTopNav />;
  }
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <TeamSwitcher teams={data.teams} />
          <button
            aria-label="Show Top Nav"
            className="rounded p-2 hover:bg-sidebar-accent focus:outline-none focus:ring"
            onClick={toggleNavLayout}
          >
            <RiArrowDownSLine className="size-6" />
          </button>
        </div>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                      isActive={!!item.isActive}
                    >
                      <a href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
