const { test, expect } = require('@playwright/test');

const LOGIN_URL = 'https://ternboard.slt.lk:55443/login';
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'Admin123,./';

test.describe('IMS Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  });

  test('TC1 - Login with valid credentials should succeed', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter username or employee' }).fill(VALID_USERNAME);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page).toHaveURL(/admin-home/i);
    await page.screenshot({ path: 'screenshots/TC1-valid-login.png', fullPage: true });
  });

  test('TC2 - Login with invalid password should show error', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter username or employee' }).fill(VALID_USERNAME);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/TC2-invalid-password.png', fullPage: true });
  });

  test('TC3 - Login with empty fields should show validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    const usernameField = page.getByRole('textbox', { name: 'Enter username or employee' });
    const isInvalid = await usernameField.evaluate((el) => !el.validity.valid);
    const validationMessage = await usernameField.evaluate((el) => el.validationMessage);

    expect(isInvalid).toBe(true);
    expect(validationMessage).toMatch(/please fill (in|out) this field/i);

    await page.screenshot({ path: 'screenshots/TC3-empty-fields.png', fullPage: true });
  });

  test('TC4 - Login with invalid username should show error', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter username or employee' }).fill('Sachini');
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/TC4-invalid-username.png', fullPage: true });
  });

  test('TC5 - Clicking Proxy Management card navigates to Proxy Management page', async ({ page }) => {
    // Log in first, since this page requires authentication
    await page.getByRole('textbox', { name: 'Enter username or employee' }).fill(VALID_USERNAME);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page).toHaveURL(/admin-home/i);

    // Click the Proxy Management card
    await page.getByText('Proxy ManagementAssign and').click();

    // Verify navigation happened
    await expect(page).toHaveURL(/proxy-management/i);

    // Verify the correct page loaded
    await expect(page.getByRole('heading', { name: /Proxy Management/i })).toBeVisible({timeout:15000});

    await page.screenshot({ path: 'screenshots/TC5-proxy-management-navigation.png', fullPage: true });
  });

});