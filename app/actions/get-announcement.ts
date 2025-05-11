"use server";

import { eq } from "drizzle-orm";
import { db } from "~/db";
// Import all schema items from the central export
import * as schema from "~/db/schema";
// Use AnnouncementComment for replies; import the Drizzle-inferred select type for comments
import type { AnnouncementDetails, AnnouncementComment } from "~/types/announcements";
import { AnnouncementPriority } from "~/db/types"; // Import enum for casting
// Infer select type for comments from the schema
type SelectAnnouncementComment = typeof schema.announcementComments.$inferSelect & {
  user?: typeof schema.userTable.$inferSelect | null;
  replies?: SelectAnnouncementComment[]; 
};


export async function getAnnouncementById(
  id: string,
): Promise<AnnouncementDetails | null> {
  try {
    // Fetch the announcement with related data
    const result = await db.query.announcements.findFirst({
      where: eq(schema.announcements.id, id), // Use schema.announcements
      with: {
        team: true, // This should populate result.team if teamId is not null
        sender: true, // This should populate result.sender
        acknowledgements: {
          with: {
            user: true,
          },
        },
        bookmarks: {
          with: {
            user: true,
          },
        },
        comments: {
          with: {
            user: true,
            replies: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    // Transform the data to match AnnouncementDetails type
    // Ensure result.sender and result.team are correctly typed by Drizzle based on the 'with' clause
    // The 'sender' and 'team' properties on 'result' will be objects if the relations are found, or null/undefined.
    // With schema errors resolved, TypeScript should infer these types correctly from result.
    const senderData = result.sender;
    const teamData = result.team;

    const senderName = senderData?.name || "Unknown User";
    const senderImage = senderData?.image;
    
    const teamName = teamData?.name || "Unknown Team";
    const teamAbbreviation = teamData?.abbreviation;

    const announcementDetails: AnnouncementDetails = {
      id: result.id,
      title: result.title || "", 
      content: result.content,
      createdAt: result.createdAt.toISOString(),
      sender: {
        name: senderName,
        image: senderImage || `https://avatar.vercel.sh/${teamAbbreviation || teamName || "user"}.png`,
      },
      teamName: teamName,
      priority: result.priority as AnnouncementPriority, // Keep this cast as priority is string enum from DB
      allowQuestions: result.allowQuestions || false, 
      allowComments: result.allowComments || false,
      acknowledgements: result.acknowledgements.map((ack) => {
        const ackUser = ack.user; // Let TS infer ack.user
        return {
          userId: ack.userId,
          userName: ackUser?.name || "Unknown User",
          userAvatar:
            ackUser?.image ||
            `https://avatar.vercel.sh/${ackUser?.name || "user"}.png`,
        };
      }),
      bookmarks: result.bookmarks.map((bookmark) => {
        const bookmarkUser = bookmark.user; // Let TS infer bookmark.user
        return {
          userId: bookmark.userId,
          userName: bookmarkUser?.name || "Unknown User",
          userAvatar:
            bookmarkUser?.image ||
            `https://avatar.vercel.sh/${bookmarkUser?.name || "user"}.png`,
        };
      }),
    };

    // Add comments if they exist and are allowed
    if (result.allowComments && result.comments) {
      // Let TS infer topLevelComments from result.comments
      const topLevelComments = result.comments?.filter(comment => !comment.parentId) || [];
      
      announcementDetails.comments = topLevelComments.map((comment): AnnouncementComment => {
        const commentUser = comment.user; // Let TS infer comment.user
        const commentUserName = commentUser?.name || "Unknown User";
        const commentUserAvatar = commentUser?.image || `https://avatar.vercel.sh/${commentUserName || "user"}.png`;

        return {
          id: comment.id,
          userId: comment.userId,
          userName: commentUserName,
          userAvatar: commentUserAvatar,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          parentId: comment.parentId || undefined,
          replies: [], // Drastically simplify: assign empty array for all replies
        };
      });
    }

    return announcementDetails;
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return null;
  }
}
