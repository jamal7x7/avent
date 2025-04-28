CREATE TABLE "team_invite_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(6) NOT NULL,
	"team_id" text NOT NULL,
	"created_by" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"max_uses" integer NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "team_invite_codes" ADD CONSTRAINT "team_invite_codes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite_codes" ADD CONSTRAINT "team_invite_codes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;