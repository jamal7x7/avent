CREATE TABLE "announcement_user_status" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"announcement_id" text NOT NULL,
	"is_received" boolean DEFAULT false NOT NULL,
	"is_favorited" boolean DEFAULT false NOT NULL,
	"received_at" timestamp,
	"favorited_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "announcement_user_status" ADD CONSTRAINT "announcement_user_status_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_user_status" ADD CONSTRAINT "announcement_user_status_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;