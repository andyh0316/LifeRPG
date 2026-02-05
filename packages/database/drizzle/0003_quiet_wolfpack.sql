ALTER TABLE "task_completions" DROP CONSTRAINT "task_completions_task_block_id_task_blocks_id_fk";
--> statement-breakpoint
ALTER TABLE "task_completions" ADD COLUMN "amount" integer;--> statement-breakpoint
ALTER TABLE "task_completions" DROP COLUMN "task_block_id";