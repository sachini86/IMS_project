require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');
const testData = require('../data/loginData');

const LOGIN_URL = `${process.env.BASE_URL}/login`;

test.describe('IMS Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  });

  test('TC1 - Login with valid credentials should succeed', async ({ page }) => {
    const { username, password } = testData.validUser;
    await login(page, username, password);
    await expect(page).toHaveURL(/admin-home/i);
    await page.screenshot({ path: 'screenshots/TC1-valid-login.png', fullPage: true });
  });

  test('TC2 - Login with invalid password should show error', async ({ page }) => {
    const { username, password } = testData.invalidPassword;
    await login(page, username, password);
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/TC2-invalid-password.png', fullPage: true });
  });

  test('TC3 - Login with empty fields should show validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    const usernameField = page.getByRole('textbox', { name: 'Enter username or employee' });
    const isInvalid = await usernameField.evaluate((el) => !el.validity.valid);
    expect(isInvalid).toBe(true);
    await page.screenshot({ path: 'screenshots/TC3-empty-fields.png', fullPage: true });
  });

  test('TC4 - Login with invalid username should show error', async ({ page }) => {
    const { username, password } = testData.invalidUsername;
    await login(page, username, password);
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/TC4-invalid-username.png', fullPage: true });
  });

  test('TC5 - Super Admin can navigate to Proxy Management page', async ({ page }) => {
  const { username, password } = testData.validUser;

  // Login as Super Admin
  await login(page, username, password);

  // Verify Super Admin Dashboard loaded
  await expect(page.getByRole('heading', { name: 'SUPER ADMIN DASHBOARD' })).toBeVisible({ timeout: 15000 });

  // Click Proxy Management card
  await page.getByText('Proxy ManagementAssign and').click();

  // Verify navigation to Proxy Management page
  await expect(page).toHaveURL(/proxy-management/i);
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  await page.screenshot({ path: 'screenshots/TC5-proxy-management-navigation.png', fullPage: true });
});

});