CREATE TABLE "announcement_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"parent_id" text
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "allow_comments" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "announcement_comments" ADD CONSTRAINT "announcement_comments_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_comments" ADD CONSTRAINT "announcement_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_comments" ADD CONSTRAINT "announcement_comments_parent_id_announcement_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."announcement_comments"("id") ON DELETE cascade ON UPDATE no action;