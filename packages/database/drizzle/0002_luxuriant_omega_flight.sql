ALTER TYPE "public"."goal_unit" RENAME TO "amount_unit";--> statement-breakpoint
ALTER TABLE "task_options" RENAME TO "task_blocks";--> statement-breakpoint
ALTER TABLE "task_completions" RENAME COLUMN "task_option_id" TO "task_block_id";--> statement-breakpoint
ALTER TABLE "task_blocks" RENAME COLUMN "goal" TO "amount";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "goal_unit" TO "amount_unit";--> statement-breakpoint
ALTER TABLE "task_completions" DROP CONSTRAINT "task_completions_task_option_id_task_options_id_fk";
--> statement-breakpoint
ALTER TABLE "task_blocks" DROP CONSTRAINT "task_options_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_blocks" DROP CONSTRAINT "task_options_updated_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_blocks" DROP CONSTRAINT "task_options_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_block_id_task_blocks_id_fk" FOREIGN KEY ("task_block_id") REFERENCES "public"."task_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_blocks" ADD CONSTRAINT "task_blocks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_blocks" ADD CONSTRAINT "task_blocks_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_blocks" ADD CONSTRAINT "task_blocks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;