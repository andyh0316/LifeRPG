# Task Templates

Add predefined task templates to the Create Task page. A new `GET /tasks/templates` endpoint returns hardcoded templates (not DB-stored). The frontend shows a dropdown; selecting a template resets the entire form.

## Backend

### 1. Create `TaskTemplateDto` response DTO

**New file:** `apps/api/src/task/dto/task-template.dto.ts`

- Fields: `key` (string, stable ID), `label` (string, display name), plus all `CreateTaskDto` fields (`name`, `desc`, `icon`, `amountUnit`, `blocks`)
- Reuse `CreateTaskBlockDto` for the blocks array type
- Follow project convention: explicit `type` in `@ApiProperty()` decorators

### 2. Create hardcoded templates data

**New file:** `apps/api/src/task/task-templates.data.ts`

- Export a `TASK_TEMPLATES: TaskTemplateDto[]` constant
- Starter templates (using valid icon names from `iconRegistry.ts`):
  - `meditation` — SelfImprovement, timed (10/20/30 min)
  - `reading` — MenuBook, timed (15/30/60 min)
  - `exercise` — FitnessCenter, timed (15/30/60 min)
  - `journaling` — HistoryEdu, untimed (1 block)
  - `stretching` — Spa, timed (10/20 min)

### 3. Add `GET /tasks/templates` endpoint

**Modify:** `apps/api/src/task/task.controller.ts`

- Add `getTemplates()` method returning `TASK_TEMPLATES` directly (no service needed)
- Place **before** `@Get(':id')` so NestJS doesn't match `"templates"` as an `:id` param
- Decorate with `@ApiOkResponse({ type: [TaskTemplateDto] })`

### 4. Regenerate OpenAPI types

```bash
pnpm --filter @life-rpg/api generate:spec && pnpm --filter @life-rpg/api-client generate:types
```

## Frontend

### 6. Update CreateTask page

**Modify:** `apps/web/src/pages/tasks/CreateTask.tsx`

- Extract `BLANK_DEFAULTS` constant from current inline `defaultValues`
- Add `reset` to `useForm` destructure
- Fetch templates: `$api.useQuery('get', '/tasks/templates')`
- Add `handleTemplateChange(key)`: find template by key, call `reset()` with its data. Empty key resets to `BLANK_DEFAULTS`
- Add `<TextField select label="Template">` dropdown at top of form with "Custom" as the empty/default option

## Files unchanged

- `task.module.ts`, `task.service.ts` — no new providers or service methods for static data
- `TaskFormFields.tsx`, `RewardTiersSection.tsx`, `TaskFormHeader.tsx` — unchanged
- Database — no migrations

## Verification

1. Run backend tests: `pnpm --filter @life-rpg/api test`
2. Navigate to Create Task, verify dropdown appears
3. Select a template — form resets with template values
4. Select "Custom" — form resets to blank
5. Submit a template-filled form — task creates successfully
