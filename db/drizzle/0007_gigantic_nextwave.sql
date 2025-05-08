ALTER TABLE "announcements" ADD COLUMN "scheduled_date" timestamp;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;