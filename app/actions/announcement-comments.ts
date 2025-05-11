"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "~/db";
import { announcementComments, announcements, teamMembers } from "~/db/schema/schema";

// Schema for comment validation
const commentSchema = z.object({
  announcementId: z.string().min(1),
  userId: z.string().min(1),
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

type CommentInput = z.infer<typeof commentSchema>;

/**
 * Add a comment to an announcement
 * Checks if:
 * 1. The announcement exists
 * 2. The announcement allows comments
 * 3. The user is a member of a team that received the announcement
 * 4. If parentId is provided, it exists and belongs to the same announcement
 */
export async function addComment(input: CommentInput) {
  try {
    // Validate input
    const parsed = commentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { announcementId, userId, content, parentId } = parsed.data;

    // Check if announcement exists and allows comments
    const announcement = await db.query.announcements.findFirst({
      where: eq(announcements.id, announcementId),
      with: {
        recipients: true,
      },
    });

    if (!announcement) {
      return {
        success: false,
        error: "Announcement not found",
      };
    }

    if (!announcement.allowComments) {
      return {
        success: false,
        error: "Comments are not allowed for this announcement",
      };
    }

    // Check if user is a member of a team that received the announcement
    const teamIds = announcement.recipients.map((r) => r.teamId);
    const userTeamMembership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      columns: {
        teamId: true,
        role: true,
      },
    });

    if (!userTeamMembership || !teamIds.includes(userTeamMembership.teamId)) {
      return {
        success: false,
        error: "You don't have permission to comment on this announcement",
      };
    }

    // If parentId is provided, check if it exists and belongs to the same announcement
    if (parentId) {
      const parentComment = await db.query.announcementComments.findFirst({
        where: eq(announcementComments.id, parentId),
      });

      if (!parentComment || parentComment.announcementId !== announcementId) {
        return {
          success: false,
          error: "Parent comment not found or doesn't belong to this announcement",
        };
      }
    }

    // Add the comment
    const commentId = nanoid();
    await db.insert(announcementComments).values({
      id: commentId,
      announcementId,
      userId,
      content,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      commentId,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      error: "Failed to add comment",
    };
  }
}

/**
 * Delete a comment from an announcement
 * Only the comment author or a teacher/admin can delete a comment
 */
export async function deleteComment(commentId: string, userId: string) {
  try {
    // Check if comment exists and belongs to the user
    const comment = await db.query.announcementComments.findFirst({
      where: eq(announcementComments.id, commentId),
      with: {
        announcement: {
          with: {
            recipients: true,
          },
        },
      },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Check if user is the author or has permission (teacher/admin)
    if (comment.userId !== userId) {
      // Check if user is a teacher or admin of the team
      const teamIds = comment.announcement.recipients.map((r) => r.teamId);
      const userTeamMembership = await db.query.teamMembers.findFirst({
        where: eq(teamMembers.userId, userId),
        columns: {
          teamId: true,
          role: true,
        },
      });

      const hasPermission =
        userTeamMembership &&
        teamIds.includes(userTeamMembership.teamId) &&
        ["teacher", "admin", "staff"].includes(userTeamMembership.role);

      if (!hasPermission) {
        return {
          success: false,
          error: "You don't have permission to delete this comment",
        };
      }
    }

    // Delete the comment
    await db.delete(announcementComments).where(eq(announcementComments.id, commentId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}