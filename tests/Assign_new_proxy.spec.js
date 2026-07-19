const { test, expect } = require('@playwright/test');

const LOGIN_URL = 'https://ternboard.slt.lk:55443/login';
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'Admin123,./';

test.describe('IMS Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 150000 });
  });



test('TC6 - Assign new proxy and verify it appears in Current Proxy Assignments', async ({ page }) => {
  // Login
  await page.getByRole('textbox', { name: 'Enter username or employee' }).fill(VALID_USERNAME);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/admin-home/i);

  // Navigate to Proxy Management
  await page.getByText('Proxy ManagementAssign and').click();
  await expect(page).toHaveURL(/proxy-management/i);
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible();

  // Select "One by one" assignment mode
  await page.getByRole('button', { name: 'One by one' }).click();

  // Select employee
  await page.locator('.css-q82u4n').click();
  await page.getByRole('option', { name: 'J M H G Jayasundara - 012444' }).click();

  // Select preset
  await page.getByText('Select a preset or choose').click();
  await page.getByText('INTERN REQUESTS ONLY PROXY').click();

  // Fill Valid From / Valid Until
  await page.getByRole('textbox').first().fill('2026-07-14T13:20');
  await page.getByRole('textbox').nth(1).fill('2026-07-14T14:00');

  // Assign and confirm
  await page.getByRole('button', { name: 'Assign Proxy' }).click();
  await page.getByRole('button', { name: 'Confirm Assignment' }).click();

  // Go to Current Proxy Assignments and verify the new row exists
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();
  await expect(page.getByRole('cell', { name: 'J C Harambearachchi 010067' }).first()).toBeVisible();

  await page.screenshot({ path: 'screenshots/TC6-assign-proxy.png', fullPage: true });
});

});