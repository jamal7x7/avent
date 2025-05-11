"use client";

import React from 'react'; // Added React import
import { format, formatDistanceToNow } from "date-fns";
import { AlertCircle, Book, Check, Clock, Star, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCardWrapper } from "~/components/animated-card-wrapper";
import { AnnouncementDetailActions } from "~/components/announcement-detail-actions";
import { AnnouncementQA } from "~/components/announcement-qa";
import { CommentsSection } from "~/components/announcements/comments-section";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  // CardDescription is not used, can be removed if not needed elsewhere
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AnnouncementPriority } from "~/db/types"; // Changed from 'import type'
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import type { AnnouncementDetails } from "~/types/announcements";

// Animation variants can remain here or be moved if shared, but for now, keep them with the component using them.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

interface AnnouncementDetailClientProps {
  announcement: AnnouncementDetails;
}

export function AnnouncementDetailClient({
  announcement,
}: AnnouncementDetailClientProps) {
  const { data: session } = useSession();
  const {
    id,

    content,
    createdAt,
    sender,
    teamName,
    priority,
    allowQuestions,
    allowComments,
    acknowledgements,
    bookmarks,
    comments,
  } = announcement;

  const displayDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });
  const exactDate = format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a");

  const role = teamName.includes("Dev")
    ? "Developer"
    : teamName.includes("Design")
      ? "Designer"
      : teamName.includes("Market")
        ? "Marketing"
        : "Teacher";

  const teamAbbreviation = teamName.substring(0, 3).toUpperCase();
  const teamDisplayInitial = teamAbbreviation.charAt(0);

  // Use Enum members as keys
  const priorityStyles: Record<AnnouncementPriority, { badge: string; ring: string; icon: JSX.Element }> = {
    [AnnouncementPriority.NORMAL]: {
      badge: "bg-secondary text-secondary-foreground",
      ring: "ring-secondary",
      icon: <Check className="h-3 w-3" />,
    },
    [AnnouncementPriority.HIGH]: {
      badge: "bg-yellow-500/20 text-yellow-500",
      ring: "ring-yellow-500",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    [AnnouncementPriority.URGENT]: {
      badge: "bg-destructive/20 text-destructive",
      ring: "ring-destructive",
      icon: <Star className="h-3 w-3 fill-destructive" />,
    },
  };
  
  // Helper to get styles, defaulting to NORMAL if priority is somehow invalid
  const getPriorityStyle = (p: AnnouncementPriority) => {
    return priorityStyles[p] || priorityStyles[AnnouncementPriority.NORMAL];
  };

  return (
    <div className="container mx-auto p-4 md:p-8 ">
      <AnimatedCardWrapper
        className="w-full max-w-4xl mx-auto"
        delay={100}
        // style prop removed as it's not accepted by AnimatedCardWrapper
        // If viewTransitionName is needed, it should be a direct prop or handled internally
      >
        <Card 
          className="rounded-2xl shadow-md  transition-all duration-300"
          style={{ viewTransitionName: `announcement-card-${id}` }} // Apply style here if Card accepts it
        >
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-0 pt-0 px-6 border-b border-border/40">
            <motion.div
              className="relative"
              initial={{ scale: 0.99, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.2,
              }}
            >
              <Avatar
                className={cn(
                  "h-12 w-12 border-2 border-border ring-2 ring-offset-2 ring-offset-background shadow-lg",
                  getPriorityStyle(priority).ring,
                )}
              >
                <AvatarImage
                  src={
                    sender.image ?? `https://avatar.vercel.sh/${teamName}.png`
                  }
                  alt={sender.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {teamDisplayInitial}
                </AvatarFallback>
              </Avatar>
              {priority === AnnouncementPriority.URGENT && ( // Compare with enum member
                <motion.div
                  className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5 border-2 border-background"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <AlertCircle className="h-3 w-3 text-card-foreground" />
                </motion.div>
              )}
            </motion.div>
            <div className="flex-1">
              <motion.div
                className="flex items-center justify-between"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground/90">
                  {teamAbbreviation ?? teamName}
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.span
                        className="text-xs text-muted-foreground flex items-center gap-1"
                        whileHover={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {displayDate}
                      </motion.span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{exactDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge
                  variant="outline"
                  className="py-1 pr-1 pl-2 font-normal text-accent-foreground/40 hover:bg-accent/20 transition-colors duration-200"
                >
                  {sender.name}
                  <Badge
                    variant="secondary"
                    className="border-transparent font-medium bg-primary/10 text-primary/50 hover:bg-primary/20 transition-colors duration-200"
                  >
                    {role}
                  </Badge>
                </Badge>
                {priority !== AnnouncementPriority.NORMAL && ( // Compare with enum member
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                        >
                          <Badge
                            variant={
                              priority === AnnouncementPriority.URGENT // Compare with enum member
                                ? "destructive"
                                : "secondary"
                            }
                            className={cn(
                              "gap-1 capitalize",
                              getPriorityStyle(priority).badge,
                            )}
                          >
                            {getPriorityStyle(priority).icon}
                            {priority} {/* Displaying the string value of enum is fine */}
                          </Badge>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Priority:{" "}
                          <span className="capitalize">{priority}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-5 px-6 text-card-foreground">
            {/* {title && (
              <motion.h2
                className="text-xl font-semibold mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              >
                {title}
              </motion.h2>
            )} */}
            <motion.div
              className="pl-4 border-l-4 border-border py-1 text-md leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0, duration: 0.5 }}
            >
              {typeof content === "string" && content.startsWith("<") ? (
                <div
                  className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{content}</p>
              )}
            </motion.div>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-4 px-6 border-t border-border/40">
            <motion.div
              className="flex space-x-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="flex items-center space-x-1"
                whileHover={{ scale: 1.05, color: "#4f46e5" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>
                  {acknowledgements.length} Acknowledgement
                  {acknowledgements.length === 1 ? "" : "s"}
                </span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-1"
                whileHover={{ scale: 1.05, color: "#4f46e5" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Book className="h-4 w-4" />
                <span>
                  {bookmarks.length} Bookmark{bookmarks.length === 1 ? "" : "s"}
                </span>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnnouncementDetailActions allowQuestions={allowQuestions} />
            </motion.div>
          </CardFooter>
        </Card>
      </AnimatedCardWrapper>

      {allowQuestions && (
        <motion.div
          className="w-full max-w-4xl mx-auto mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Separator className="my-6" />
          <motion.h2
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            Questions & Answers
          </motion.h2>
          <AnnouncementQA
            announcementId={announcement.id}
            questions={[
              // Mock data for demonstration - this should ideally come from the announcement prop if fetched server-side
              {
                id: "q1",
                content: "When will the slides from the meeting be available?",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                user: {
                  id: "user4",
                  name: "Edward",
                  avatar: "https://randomuser.me/api/portraits/men/4.jpg",
                },
                answers: [
                  {
                    id: "a1",
                    content:
                      "The slides will be shared via email by end of day. They'll also be available in the shared drive.",
                    createdAt: new Date(Date.now() - 1800000).toISOString(),
                    user: {
                      id: "user-teacher",
                      name: "Alice Wonderland",
                      avatar:
                        "https://randomuser.me/api/portraits/women/44.jpg",
                      role: "Teacher",
                    },
                  },
                ],
              },
              {
                id: "q2",
                content:
                  "Will there be a follow-up meeting to discuss the Q4 strategy in more detail?",
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                user: {
                  id: "user5",
                  name: "Frank",
                  avatar: "https://randomuser.me/api/portraits/men/5.jpg",
                },
                answers: [],
              },
            ]}
          />
        </motion.div>
      )}

      {allowComments && (
        <motion.div
          className="w-full max-w-4xl mx-auto mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Separator className="my-6" />
          <CommentsSection
            announcementId={announcement.id}
            userId={session?.user?.id || ""}
            userRole={session?.user?.role || "student"}
            allowComments={allowComments}
            comments={comments}
          />
        </motion.div>
      )}
    </div>
  );
}
