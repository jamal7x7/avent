"use client";

import { useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AnnouncementForm } from "~/components/announcement-form";

interface AnnouncementsPageClientWrapperProps {
  children: ReactNode; // To accept AnnouncementList (Server Component)
}

export default function AnnouncementsPageClientWrapper({
  children,
}: AnnouncementsPageClientWrapperProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="relative h-full w-full max-w-4xl mx-auto py-8 md:px-4 space-y-8">
      {/* Render the Server Component child (AnnouncementList) */}
      {children}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="fixed bottom-6 border-1 border-secondary-foreground/10 right-6 h-14 w-14 rounded-xl shadow-lg z-50"
            size="icon"
            aria-label="Add new announcement"
            // onClick={() => setIsAddDialogOpen(true)} // DialogTrigger handles this
          >
            <PlusIcon className="h-6 w-6 size-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0">

          <DialogHeader className="p-6 pb-4 hidden">
            <DialogTitle className="text-xl">Create New Announcement</DialogTitle>
          </DialogHeader>
          <div className=" max-h-[80vh] overflow-y-auto">
            <AnnouncementForm 
              onSuccess={() => setIsAddDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
