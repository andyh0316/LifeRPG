import { test, expect } from '@playwright/test';
import type { components } from '@life-rpg/api-client';

type CreateTaskDto = components['schemas']['CreateTaskDto'];
type UpdateTaskDto = components['schemas']['UpdateTaskDto'];

test('edit a task name and description', async ({ page }) => {
  // setup — create a task via the UI so we have something to edit
  const originalName = `Task to Edit ${Date.now()}`;
  await page.goto('/tasks/create');
  await page.getByLabel('Name').fill(originalName);
  await page.getByLabel('Description').fill('Original description');
  await page.getByLabel('XP').fill('10');
  await page.getByLabel('Coins').fill('5');

  const createRequest = page.waitForRequest(
    (req) => req.url().includes('/tasks') && req.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await createRequest;
  await expect(page).toHaveURL(/\/tasks$/);

  // act — click the edit button for the created task
  const taskItem = page.getByRole('listitem').filter({ hasText: originalName });
  await taskItem.getByRole('button').nth(1).click();
  await expect(page).toHaveURL(/\/tasks\/\d+\/edit$/);

  // Change the name and description
  const updatedName = `Edited Task ${Date.now()}`;
  const nameField = page.getByLabel('Name');
  await nameField.clear();
  await nameField.fill(updatedName);
  const descField = page.getByLabel('Description');
  await descField.clear();
  await descField.fill('Updated description');

  // Intercept the PATCH request so we can verify the payload
  const patchRequest = page.waitForRequest(
    (req) => req.url().includes('/tasks/') && req.method() === 'PATCH',
  );

  await page.getByRole('button', { name: 'Save' }).click();

  // assert
  const request = await patchRequest;
  const body: UpdateTaskDto = request.postDataJSON();
  expect(body).toMatchObject({
    name: updatedName,
    desc: 'Updated description',
  } satisfies Partial<UpdateTaskDto>);

  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText(updatedName)).toBeVisible();
});
