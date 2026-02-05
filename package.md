docker:up # Start containers
docker:down # Stop containers
docker:nuke # Stop + delete volumes

db:generate # Generate migration files
db:migrate # Apply migrations
db:backup # Backup DB
db:restore # Restore DB
db:studio # Open DB browser
db:reset # Nuke + recreate + migrate

test-db:migrate # Apply migrations (test DB)
test-db:reset # Nuke + recreate + migrate (test DB)

dev # API + Web
dev:test # API (test DB) + Web
dev:api # API only
dev:api:test # API only (test DB)
dev:web # Web only

build # Build all
build:api # Build API
build:web # Build Web

test # Unit tests
test:e2e # E2E tests (headless)
test:e2e:debug # E2E tests (headed, slow)

generate:api-client # Regenerate OpenAPI client
menu # Interactive picker
