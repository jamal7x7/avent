"use client";

import { usePathname } from "next/navigation"; // Import usePathname
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTransition } from "react";

import {
  type RemixiconComponentType,
  RiAddFill,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowUpSLine,
  RiBardLine,
  RiBookOpenLine,
  RiCalendar2Line,
  RiCodeSSlashLine,
  RiLayoutLeftLine,
  RiLeafLine,
  RiLoginCircleLine,
  RiLogoutBoxLine,
  RiNotification3Line,
  RiScanLine,
  RiSearch2Line,
  RiSettings3Line,
  RiSideBarLine,
  RiTeamLine,
  RiUserFollowLine,
} from "@remixicon/react";
import { PlusIcon, PlusSquare } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "~/components/language-switcher";
import { QuickAddDialog } from "~/components/quick-add-dialog";
import { SearchForm } from "~/components/search-form";
import { TeamSwitcher } from "~/components/team-switcher";
// Remove ThemeToggle import as it's moved to SettingsModal
// import { ThemeToggle } from "~/components/theme-toggle";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // Added
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useNavLayoutStore } from "~/hooks/use-nav-layout";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { AuthAvatar } from "./auth-avatar";
import { NotificationsWidget } from "./notifications/notifications-widget";
import { Button } from "./ui/button";

type NavItem = {
  title: string;
  url: string;
  icon: RemixiconComponentType;
  isActive?: boolean;
  roles?: string[];
};

// This is sample data.
export const data = {
  teams: [
    {
      name: "Connect",
      abbreviation: "CON",
      image: `https://avatar.vercel.sh/${"CON"}.png`,
    },
    {
      name: "Editor",
      abbreviation: "EDI",
      image: `https://avatar.vercel.sh/${"EDI"}.png`,
    },
    {
      name: "Content",
      abbreviation: "CTN",
      image: `https://avatar.vercel.sh/${"CTN"}.png`,
    },
  ],
  navMain: [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiScanLine,
          // isActive: true, // Removed
        },
        // {
        //   title: "Contacts",
        //   url: "/dashboard/contacts",
        //   icon: RiUserFollowLine,
        //   // isActive: false, // Removed
        // },
        {
          title: "Announcements",
          url: "/dashboard/announcements",
          icon: RiNotification3Line,
          roles: ["teacher"],
        },
        {
          title: "Teams",
          url: "/dashboard/team-management",
          icon: RiTeamLine,
          roles: ["teacher"],
        },
        {
          title: "Courses",
          url: "/dashboard/courses",
          icon: RiBookOpenLine,
          roles: ["teacher"],
        },
        {
          title: "Schedule",
          url: "/dashboard/schedule",
          icon: RiCalendar2Line,
          roles: ["teacher"],
        },
      ] as NavItem[],
    },
    // {
    //   title: "Other",
    //   url: "#",
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "#",
    //       icon: RiSettings3Line,
    //     },
    //     {
    //       title: "Help Center",
    //       url: "#",
    //       icon: RiLeafLine,
    //     },
    //   ],
    // },
  ],
};

function DashboardTopNav() {
  const toggleNavLayout = useNavLayoutStore((state) => state.toggleNavLayout);
  const { data: session } = useSession();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname(); // Get current pathname

  // Focus input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Split nav groups for layout logic
  const mainGroups = data.navMain.filter((g) => g.title !== "Other");
  const otherGroup = data.navMain.find((g) => g.title === "Other");
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 w-full bg-sidebar text-sidebar-foreground shadow flex flex-row items-center justify-between px-4 py-2 gap-2 border-b border-border",
        isPending &&
          "opacity-60 transition-opacity duration-300 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          aria-label="Show Sidebar"
          className="rounded-lg p-2 bg-/10 hover:bg-sidebar-accent focus:outline-none focus:ring transition-colors"
          onClick={() => startTransition(() => toggleNavLayout())}
        >
          <RiArrowDownSLine className="w-6 h-6 text-muted-foreground/60 transition-transform" />
        </Button>
        <TeamSwitcher teams={data.teams} />
        <div className="flex-1 flex flex-wrap gap-4 md:gap-8">
          {mainGroups.map((group) => (
            <div
              key={group.title}
              className="flex  flex-row items-center gap-2"
            >
              {/* Removed group title for cleaner topnav */}
              <div className="flex flex-row gap-2 md:gap-4">
                {group.items.map((item) => {
                  const isActive = pathname === item.url; // Dynamic check
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "relative inline-flex  flex-col md:flex-row items-center gap-1 py-3 px-3  rounded-md text-foreground/50 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
                        isActive && "bg-sidebar-foreground/0 text-foreground",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "text-muted-foreground/50 size-4",
                            isActive &&
                              "fill-primary/60 text-muted-foreground/50",
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 ml-auto items-center">
        {/* Search button, expands on click */}
        <div
          className={
            searchExpanded
              ? "w-64 transition-all duration-300"
              : "w-9 transition-all duration-300"
          }
        >
          <form
            className="relative"
            onFocus={() => setSearchExpanded(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget))
                setSearchExpanded(false);
            }}
            tabIndex={-1}
          >
            <div
              className={
                searchExpanded
                  ? "flex items-center w-full h-9"
                  : "flex items-center w-9 h-9"
              }
            >
              <span className="pl-2 flex items-center text-muted-foreground">
                <RiSearch2Line size={20} />
              </span>
              {searchExpanded && (
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="block w-full h-9 rounded-md border bg-background px-2 py-1 text-sm shadow-xs transition-all outline-none border-input ml-2"
                  onBlur={(e) => {
                    if (!e.currentTarget.value && !e.relatedTarget)
                      setSearchExpanded(false);
                  }}
                  onClick={() => setSearchExpanded(true)}
                  aria-label="Search"
                />
              )}
            </div>
          </form>
        </div>
        {/* Remove ThemeToggle from top nav */}
        {/* <ThemeToggle /> */}
        <LanguageSwitcher isCollapsed={true} />
        <AuthAvatar
          name={session?.user?.name || "User"}
          email={session?.user?.email || ""}
          image={session?.user?.image || undefined}
          isDashboard={true}
        />
      </div>
    </nav>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const toggleNavLayout = useNavLayoutStore((state) => state.toggleNavLayout);
  const { data: session } = useSession();
  const pathname = usePathname(); // Get current pathname
  // Detect collapsed state using sidebar context data attribute
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    // Listen for sidebar collapse state via data attribute
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

  if (!useNavLayoutStore.getState().isSidebar) {
    return <DashboardTopNav />;
  }
  return (
    <Sidebar
      className={cn(
        "transition-transform duration-300 ease-in-out",
        isCollapsed ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0", // Always show on md+
      )}
      collapsible="icon"
      variant="inset"
      {...props}
      data-sidebar="sidebar"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between">
          {/* Only show TeamSwitcher if not collapsed */}

          <Button
            aria-label="Show Top Nav"
            className="rounded-lg p-2 bg-/10 hover:bg-sidebar-accent focus:outline-none focus:ring transition-colors"
            onClick={() => toggleNavLayout()}
          >
            <span
              className="inline-flex items-center justify-center transition-transform duration-200"
              style={{
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
              }}
            >
              <RiArrowUpSLine className="w-6 h-6 text-muted-foreground/60" />
            </span>
          </Button>
          {!isCollapsed && <TeamSwitcher teams={data.teams} />}
        </div>
        <hr className="border-t border-border mx-2 -mt-px" />
        {/* Search: icon only in collapsed mode */}
        {/* {isCollapsed ? (
          <Button
            className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-sidebar-accent focus:outline-none focus:ring mx-auto mt-3 cursor-pointer"
            aria-label="Search"
            tabIndex={0}
          >
            <RiSearch2Line size={20} />
          </Button>
        ) : (
          <SearchForm className="mt-3" />
        )} */}

        {/* --- Quick Add Dialog/Drawer --- */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-6 w-full">
                <QuickAddDialog isCollapsed={isCollapsed} className="w-full" />
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={5}>
                Quick Add
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {/* --- End Quick Add Dialog/Drawer --- */}
      </SidebarHeader>
      <SidebarContent>
        {/* SidebarGroup: only icons and tooltips in collapsed mode */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel
              className={
                isCollapsed ? "sr-only" : "uppercase text-muted-foreground/60"
              }
            >
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className={isCollapsed ? "px-0" : "px-2"}>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={
                        isCollapsed
                          ? "justify-center p-2 min-w-0 w-9 h-9"
                          : "gap-3 h-9"
                      }
                      isActive={pathname === item.url}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link
                        href={item.url}
                        tabIndex={0}
                        aria-label={item.title}
                      >
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/60"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        {!isCollapsed && (
                          <span
                            className={cn(
                              " text-accent-foreground/60 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
                              pathname === item.url &&
                                "text-sidebar-accent-foreground ",
                            )}
                          >
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: only icons and tooltips in collapsed mode */}
      <SidebarFooter
        className={cn(
          "flex flex-col gap-2 border-t border-border",
          isCollapsed ? "items-center p-2" : "p-4",
        )}
      >
        {/* Settings Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-center",
                  isCollapsed ? "h-9 w-9" : "h-auto p-2",
                  "hover:bg-sidebar-accent focus:outline-none focus:ring cursor-pointer",
                )}
                aria-label="Settings"
              >
                <Link href="/dashboard/settings">
                  <RiSettings3Line
                    size={isCollapsed ? 20 : 16}
                    className={cn(!isCollapsed && "mr-2")}
                  />
                  {!isCollapsed && <span>Settings</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Language Switcher */}
        <div
          className={cn(
            "flex",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <LanguageSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Theme Toggle - Removed, handled in SettingsModal */}
        {/* <div
          className={cn(
            "flex",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <ThemeToggle isCollapsed={isCollapsed} />
        </div> */}

        {/* User Avatar/Auth */}
        <div
          className={cn(
            "flex w-full",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <AuthAvatar
            name={session?.user?.name || "User"}
            email={session?.user?.email || ""}
            image={session?.user?.image || undefined}
            role={session?.user?.role || "user"}
            showDetails={!isCollapsed}
            isDashboard={true} // Assuming this is always in the dashboard context
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export const data1 = {
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
          url: "/dashboard",
          icon: RiScanLine,
          // isActive: true, // Removed
        },
        {
          title: "Contacts",
          url: "/dashboard/contacts",
          icon: RiUserFollowLine,
          // isActive: false, // Removed
        },
        {
          title: "Announcements",
          url: "/dashboard/announcements",
          icon: RiNotification3Line,
          roles: ["teacher"],
        },
        {
          title: "Team Management",
          url: "/dashboard/team-management",
          icon: RiTeamLine,
          roles: ["teacher"],
        },
        {
          title: "Courses",
          url: "/dashboard/courses",
          icon: RiBookOpenLine,
          roles: ["teacher"],
        },
        {
          title: "Schedule",
          url: "/dashboard/schedule",
          icon: RiCalendar2Line,
          roles: ["teacher"],
        },
      ] as NavItem[],
    },
    // {
    //   title: "Other",
    //   url: "#",
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "#",
    //       icon: RiSettings3Line,
    //     },
    //     {
    //       title: "Help Center",
    //       url: "#",
    //       icon: RiLeafLine,
    //     },
    //   ],
    // },
  ],
};
