-- Backfill user_character rows for all existing users that don't have one yet
INSERT INTO "user_character" ("user_id", "level", "xp", "coins", "created_at", "updated_at")
SELECT "id", 1, 0, 0, NOW(), NOW()
FROM "users"
WHERE "id" NOT IN (SELECT "user_id" FROM "user_character");
