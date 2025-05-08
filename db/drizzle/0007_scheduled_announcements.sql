ALTER TABLE "announcements" ADD COLUMN "scheduled_date" timestamp;
ALTER TABLE "announcements" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;