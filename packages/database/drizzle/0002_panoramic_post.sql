CREATE TYPE "public"."goal_period" AS ENUM('day-long', 'week-long', 'month-long');--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_amount" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_period" "goal_period";