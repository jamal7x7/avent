ALTER TABLE "announcements" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "allow_questions" boolean DEFAULT false NOT NULL;