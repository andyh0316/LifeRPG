CREATE TABLE "user_character_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	"deleted_at" timestamp with time zone,
	"user_id" integer NOT NULL,
	"daily_xp_target" integer,
	"weekly_xp_target" integer,
	"monthly_xp_target" integer,
	"quarterly_xp_target" integer,
	"yearly_xp_target" integer,
	CONSTRAINT "user_character_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_character_settings" ADD CONSTRAINT "user_character_settings_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_character_settings" ADD CONSTRAINT "user_character_settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_character_settings" ADD CONSTRAINT "user_character_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_character" DROP COLUMN "daily_xp_target";--> statement-breakpoint
ALTER TABLE "user_character" DROP COLUMN "weekly_xp_target";