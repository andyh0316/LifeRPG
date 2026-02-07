DELETE FROM task_completions;
DELETE FROM task_blocks;
DELETE FROM tasks;

ALTER TYPE "public"."amount_unit" ADD VALUE 'count' BEFORE 'minutes';

