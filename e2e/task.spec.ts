import { test, expect } from '@playwright/test';
import type { components } from '@life-rpg/api-client';

type CreateTaskDto = components['schemas']['CreateTaskDto'];
type UpdateTaskDto = components['schemas']['UpdateTaskDto'];

test.describe.serial('task', () => {
  let taskName: string;

  // Creates a timed task "Morning Run <timestamp>" with one tier (30 min, 20 XP, 10 coins) and verifies the POST payload and redirect.
  test('create a timed task with one tier', async ({ page }) => {
    // Use a unique name so repeated runs don't collide
    taskName = `Morning Run ${Date.now()}`;

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

  // Edits the "Morning Run <timestamp>" task created above — changes name to "Edited Task <timestamp>" and description, verifying the PATCH payload.
  test('edit a task name and description', async ({ page }) => {
    // Navigate to the task list and click the edit button for the created task
    await page.goto('/tasks');
    const taskItem = page.getByRole('listitem').filter({ hasText: taskName });
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
});
