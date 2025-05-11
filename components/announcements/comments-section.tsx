"use client";

import { formatDistanceToNow } from "date-fns";
import { Reply, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addComment, deleteComment } from "~/app/actions/announcement-comments";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import type { AnnouncementComment } from "~/types/announcements";

interface CommentsSectionProps {
  announcementId: string;
  userId: string;
  userRole: string;
  allowComments: boolean;
  comments?: AnnouncementComment[];
}

export function CommentsSection({
  announcementId,
  userId,
  userRole,
  allowComments,
  comments = [],
}: CommentsSectionProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addComment({
        announcementId,
        userId,
        content: newComment,
      });

      if (result.success) {
        setNewComment("");
        toast.success("Comment added", {
          description: "Your comment has been added successfully",
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to add comment",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addComment({
        announcementId,
        userId,
        content: replyContent,
        parentId,
      });

      if (result.success) {
        setReplyContent("");
        setReplyToId(null);
        toast.success("Reply added", {
          description: "Your reply has been added successfully",
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to add reply",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId, userId);

      if (result.success) {
        toast.success("Comment deleted", {
          description: "The comment has been deleted successfully",
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete comment",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  const canModerate = ["teacher", "admin", "staff"].includes(userRole);

  if (!allowComments) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>

      {/* New comment form */}
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`https://avatar.vercel.sh/${userId}.png`}
            alt="User"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={comment.userAvatar}
                        alt={comment.userName}
                      />
                      <AvatarFallback>
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{comment.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setReplyToId(replyToId === comment.id ? null : comment.id)
                    }
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  {(canModerate || comment.userId === userId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Reply form */}
              {replyToId === comment.id && (
                <div className="ml-12 flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${userId}.png`}
                      alt="User"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyToId(null);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-3">
                  {comment.replies.map((reply) => (
                    <Card key={reply.id}>
                      <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={reply.userAvatar}
                              alt={reply.userName}
                            />
                            <AvatarFallback>
                              {reply.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reply.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{reply.content}</p>
                      </CardContent>
                      <CardFooter>
                        {(canModerate || reply.userId === userId) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(reply.id)}
                            className="ml-auto"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
