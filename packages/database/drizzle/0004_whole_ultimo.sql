-- Create a separate enum for items with hours/days (tasks keep the original amount_unit enum)
CREATE TYPE "public"."item_amount_unit" AS ENUM('count', 'minutes', 'hours', 'days');--> statement-breakpoint

-- Drop the old default so Postgres doesn't try to cast it during the type change
ALTER TABLE "items" ALTER COLUMN "amount_unit" DROP DEFAULT;--> statement-breakpoint

-- Convert column from amount_unit enum → text → item_amount_unit enum
ALTER TABLE "items" ALTER COLUMN "amount_unit" SET DATA TYPE item_amount_unit USING amount_unit::text::item_amount_unit;--> statement-breakpoint

-- Restore the default under the new enum type
ALTER TABLE "items" ALTER COLUMN "amount_unit" SET DEFAULT 'count';