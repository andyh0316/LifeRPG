CREATE TYPE "public"."goal_unit" AS ENUM('minutes');--> statement-breakpoint
CREATE TABLE "task_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	"deleted_at" timestamp with time zone,
	"task_id" integer NOT NULL,
	"goal" integer,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"coin_reward" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "task_option_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_unit" "goal_unit";--> statement-breakpoint
ALTER TABLE "task_options" ADD CONSTRAINT "task_options_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_options" ADD CONSTRAINT "task_options_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_options" ADD CONSTRAINT "task_options_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_option_id_task_options_id_fk" FOREIGN KEY ("task_option_id") REFERENCES "public"."task_options"("id") ON DELETE no action ON UPDATE no action;

-- Data migration: create a default task_option for each existing task
INSERT INTO "task_options" ("task_id", "xp_reward", "coin_reward", "sort_order", "created_at", "updated_at")
SELECT "id", "xp_reward", "coin_reward", 0, now(), now()
FROM "tasks";

-- Backfill task_completions with the matching task_option
UPDATE "task_completions" tc
SET "task_option_id" = (
  SELECT to2.id FROM "task_options" to2
  WHERE to2.task_id = tc.task_id
  ORDER BY to2.id ASC
  LIMIT 1
);

