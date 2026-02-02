CREATE TABLE "user_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by_user_id" uuid,
	"updated_by_user_id" uuid,
	CONSTRAINT "user_character_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_character" ADD CONSTRAINT "user_character_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_character" ADD CONSTRAINT "user_character_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_character" ADD CONSTRAINT "user_character_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "xp";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "coins";