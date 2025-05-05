"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { AddTeamForm } from "~/components/add-team-form";
import { AnnouncementForm } from "~/components/announcement-form";
import { JoinTeamForm } from "~/components/join-team-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

type QuickAddDialogProps = {
  isCollapsed?: boolean;
  className?: string;
};

export function QuickAddDialog({
  isCollapsed = false,
  className,
}: QuickAddDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("announcement");
  const isMobile = useIsMobile();

  // Fetch teams for the AddTeamForm
  const [teams, setTeams] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  // Function to handle dialog/drawer close
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset to default tab when closing
      setTimeout(() => setActiveTab("announcement"), 300);
    }
  };

  // Fetch teams when dialog opens
  const handleOpen = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const triggerButton = (
    <Button
      variant="ghost"
      size={isCollapsed ? "icon" : "default"}
      className={cn(
        "justify-center", // Common styles
        isCollapsed ? "h-9 w-9" : "h-auto p-2", // Size-specific styles
        "hover:bg-primary/30 hover:text-primary text-accent-foreground/60 bg-primary/40 focus:outline-none focus:ring cursor-pointer", // Interaction styles
        className,
      )}
      aria-label="Quick Add"
      onClick={() => handleOpen()}
    >
      <PlusIcon
        size={isCollapsed ? 26 : 16} // Adjust icon size
        className={cn(!isCollapsed && "mr-2")} // Add margin when expanded
      />
      {!isCollapsed && <span>Quick Add</span>}
    </Button>
  );

  const tabsContent = (
    <Tabs
      defaultValue="announcement"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="announcement">Announcement</TabsTrigger>
        <TabsTrigger value="add-team">Add Team</TabsTrigger>
        <TabsTrigger value="join-team">Join Team</TabsTrigger>
      </TabsList>
      <TabsContent value="announcement" className="mt-4">
        <AnnouncementForm />
      </TabsContent>
      <TabsContent value="add-team" className="mt-4">
        <AddTeamForm teams={teams} onTeamAdded={() => handleOpen()} />
      </TabsContent>
      <TabsContent value="join-team" className="mt-4">
        <JoinTeamForm />
      </TabsContent>
    </Tabs>
  );

  // Use Drawer for mobile, Dialog for desktop
  return isMobile ? (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Quick Add</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8">{tabsContent}</div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        {tabsContent}
      </DialogContent>
    </Dialog>
  );
}
