ALTER TABLE "announcement_user_status" RENAME COLUMN "is_received" TO "is_acknowledged";--> statement-breakpoint
ALTER TABLE "announcement_user_status" RENAME COLUMN "is_favorited" TO "is_bookmarked";--> statement-breakpoint
ALTER TABLE "announcement_user_status" RENAME COLUMN "received_at" TO "acknowledged_at";--> statement-breakpoint
ALTER TABLE "announcement_user_status" RENAME COLUMN "favorited_at" TO "bookmarked_at";