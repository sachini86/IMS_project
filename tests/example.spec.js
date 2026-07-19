const { test, expect } = require('@playwright/test');

test('IMS login page loads with correct title', async ({ page }) => {
  await page.goto('https://ternboard.slt.lk:55443/login');
  await expect(page).toHaveTitle(/Internship Management System/i);
});