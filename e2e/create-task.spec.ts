import { test, expect } from '@playwright/test';
import type { components } from '@life-rpg/api-client';

type CreateTaskDto = components['schemas']['CreateTaskDto'];

test('create a timed task with one tier', async ({ page }) => {
  // Use a unique name so repeated runs don't collide
  const taskName = `Morning Run ${Date.now()}`;

  // Navigate to the Create Task page
  await page.goto('/tasks/create');

  // Fill in the task name and description
  await page.getByLabel('Name').fill(taskName);
  await page.getByLabel('Description').fill('Go for a 30 min run');

  // Open the Unit dropdown and select "Minutes"
  await page.getByLabel('Unit').click();
  await page.getByRole('option', { name: 'Minutes' }).click();

  // Fill in the tier: 30 minutes, 20 XP, 10 coins
  await page.getByRole('spinbutton', { name: 'Minutes' }).fill('30');
  await page.getByLabel('XP').fill('20');
  await page.getByLabel('Coins').fill('10');

  // Intercept the POST request so we can verify the payload
  const requestPromise = page.waitForRequest(
    (req) => req.url().includes('/tasks') && req.method() === 'POST',
  );

  // Click Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify the request payload is correct
  const request = await requestPromise;
  const body: CreateTaskDto = request.postDataJSON();
  expect(body).toMatchObject({
    name: taskName,
    desc: 'Go for a 30 min run',
    amountUnit: 'minutes',
    blocks: [{ amount: 30, xpReward: 20, coinReward: 10 }],
  } satisfies Partial<CreateTaskDto>);

  // Verify we navigated back to the task list
  await expect(page).toHaveURL(/\/tasks$/);

  // Verify the new task shows up in the list
  await expect(page.getByText(taskName)).toBeVisible();
});
