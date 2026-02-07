ALTER TABLE "task_blocks" ALTER COLUMN "amount" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "task_blocks" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "amount_unit" SET DEFAULT 'count';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "amount_unit" SET NOT NULL;