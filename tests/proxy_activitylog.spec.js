require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/login');
const loginData = require('../data/loginData');
const proxyData = require('../data/proxyAssignData');

test.describe('IMS Proxy Management Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 150000 });
    const { username, password } = loginData.validUser;
    await login(page, username, password);
    await expect(page.getByRole('heading', { name: 'SUPER ADMIN DASHBOARD' })).toBeVisible({ timeout: 15000 });
  });

  test('TC12 - Assigning a proxy creates a corresponding entry in Activity Logs', async ({ page }) => {
    const { activityLogTest } = proxyData;

    // Step 1: Navigate to Proxy Management
    const proxyCard = page.getByText('Proxy ManagementAssign and');
    await expect(proxyCard).toBeVisible({ timeout: 15000 });
    await proxyCard.click();

    await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

    // Step 2: Assign a new proxy (One by one)
    await page.getByRole('button', { name: 'One by one' }).click();

    await page.locator('svg').nth(5).click();
    await page.getByRole('option', { name: activityLogTest.employeeName }).click();

    await page.locator('form').getByRole('img').click();
    await page.getByText(activityLogTest.presetName).click();

    await page.getByRole('textbox').first().fill(activityLogTest.validFrom);
    await page.getByRole('textbox').nth(1).fill(activityLogTest.validUntil);

    await page.getByRole('button', { name: 'Assign Proxy' }).click();
    await expect(page.getByRole('button', { name: 'Confirm Assignment' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Assignment' }).click();

    await page.waitForTimeout(1500); // allow the assignment to fully process

    // Step 3: Navigate to Activity Logs tab
    await page.getByRole('button', { name: 'Activity Logs' }).click();
    await expect(page.getByRole('heading', { name: 'Activity Logs' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // DEBUG: log all activity log rows so we can see the real text format
    const allLogRows = page.locator('table tbody tr');
    const allLogRowCount = await allLogRows.count();
    console.log(`Total activity log rows found: ${allLogRowCount}`);

    for (let i = 0; i < Math.min(allLogRowCount, 5); i++) {
      const rowText = await allLogRows.nth(i).textContent();
      console.log(`Row ${i}: ${rowText}`);
    }

    // Step 4: Verify a new entry exists for this employee - matching last name only (safe against concatenation formatting)
    const logRow = page.locator('table tbody tr').filter({ hasText: activityLogTest.employeeLogText }).first();
    await expect(logRow).toBeVisible({ timeout: 10000 });

    const logRowText = await logRow.textContent();
    console.log(`Activity log entry found: ${logRowText}`);

    // Verify it shows "Success" as the result
    await expect(logRow).toContainText('Success');

    // Verify the action mentions assigning/proxy
    await expect(logRow).toContainText(/assign/i);

    await page.screenshot({ path: 'screenshots/activity-log-verification.png', fullPage: true });
  });

  test('TC13 - Disable and Remove actions on assignments are recorded in Activity Logs', async ({ page }) => {
  // Step 1: Navigate to Proxy Management
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();

  // --- Part 1: Disable action ---
  const activeRow = page.locator('table tbody tr').filter({ hasText: 'ACTIVE' }).first();
  await expect(activeRow).toBeVisible({ timeout: 10000 });

  const disableRowText = await activeRow.textContent();
  console.log(`Row selected for Disable: ${disableRowText}`);

  // Extract just the employee's last name portion for reliable matching later
  // (adjust extraction logic once we confirm exact row text format)
  const disableEmployeeIdentifier = disableRowText.substring(0, 20); // rough slice - refine after seeing real output

  await activeRow.getByRole('button', { name: 'Disable' }).click();
  await page.waitForTimeout(500);

  const confirmDisableButton = page.getByRole('button', { name: /confirm|yes|ok/i });
  if (await confirmDisableButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmDisableButton.click();
  }

  await page.waitForTimeout(1500);

  // Go check Activity Logs for the Disable entry
  await page.getByRole('button', { name: 'Activity Logs' }).click();
  await expect(page.getByRole('heading', { name: 'Activity Logs' })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Log the most recent entry (should be at the top)
  const mostRecentLogRow = page.locator('table tbody tr').first();
  const mostRecentLogText = await mostRecentLogRow.textContent();
  console.log(`Most recent Activity Log entry after Disable: ${mostRecentLogText}`);

  await expect(mostRecentLogRow).toContainText(/disable/i);
  await expect(mostRecentLogRow).toContainText('Success');

  await page.screenshot({ path: 'screenshots/activity-log-disable-check.png', fullPage: true });

  // --- Part 2: Remove action ---
  // Go back to Assignments tab
  await page.getByRole('button', { name: 'Assignments' }).click();
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();

  const rowToRemove = page.locator('table tbody tr').first();
  const removeRowText = await rowToRemove.textContent();
  console.log(`Row selected for Remove: ${removeRowText}`);

  await rowToRemove.getByRole('button', { name: 'Remove' }).click();
  await page.waitForTimeout(500);

  const confirmRemoveButton = page.getByRole('button', { name: /confirm|yes|ok/i });
  if (await confirmRemoveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmRemoveButton.click();
  }

  await page.waitForTimeout(1500);

  // Go check Activity Logs for the Remove entry
  await page.getByRole('button', { name: 'Activity Logs' }).click();
  await expect(page.getByRole('heading', { name: 'Activity Logs' })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  const mostRecentLogRowAfterRemove = page.locator('table tbody tr').first();
  const mostRecentLogTextAfterRemove = await mostRecentLogRowAfterRemove.textContent();
  console.log(`Most recent Activity Log entry after Remove: ${mostRecentLogTextAfterRemove}`);

  await expect(mostRecentLogRowAfterRemove).toContainText(/remove/i);
  await expect(mostRecentLogRowAfterRemove).toContainText('Success');

  await page.screenshot({ path: 'screenshots/activity-log-remove-check.png', fullPage: true });
});


test('TC14 - Activity Logs table row count matches summary text', async ({ page }) => {
  // Step 1: Navigate to Proxy Management
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });

  // Step 2: Navigate to Activity Logs tab
  await page.getByRole('button', { name: 'Activity Logs' }).click();
  await expect(page.getByRole('heading', { name: 'Activity Logs' })).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Step 3: Read the summary text (adjust regex if format differs from Proxy Assignments page)
  const summaryLocator = page.getByText(/Showing \d+-?\d* of \d+/i);
  await expect(summaryLocator).toBeVisible({ timeout: 10000 });
  const summaryText = await summaryLocator.textContent();
  console.log(`Summary text found: ${summaryText}`);

  // Try matching "Showing X-Y of Z" format first
  let match = summaryText.match(/Showing (\d+)-(\d+) of (\d+)/i);
  let expectedRowCount;

  if (match) {
    const shownStart = parseInt(match[1], 10);
    const shownEnd = parseInt(match[2], 10);
    expectedRowCount = shownEnd - shownStart + 1;
    console.log(`Format: range - Showing ${shownStart}-${shownEnd} of ${match[3]}`);
  } else {
    // Fallback: try "Showing X of Y" format (single number, e.g. "Showing 0 of 0")
    match = summaryText.match(/Showing (\d+) of (\d+)/i);
    expect(match).not.toBeNull();
    expectedRowCount = parseInt(match[1], 10);
    console.log(`Format: single count - Showing ${match[1]} of ${match[2]}`);
  }

  // Step 4: Count actual rows in the table body
  const actualRowCount = await page.locator('table tbody tr').count();

  console.log(`Expected row count: ${expectedRowCount}, Actual row count: ${actualRowCount}`);

  // Step 5: Assert they match
  expect(actualRowCount).toBe(expectedRowCount);

  await page.screenshot({ path: 'screenshots/activity-log-row-count.png', fullPage: true });
});

test('TC15 - Date filter should show assignments matching the selected date (currently failing)', async ({ page }) => {
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Activity Logs' }).click();

  const { displayText: targetDateText, filterValue: targetDateFilterValue } = proxyData.filterTest.bugCheckDate;

  // STEP 1: Check UNFILTERED table - only look at the "Valid From" column (index 3)
  const allRows = page.locator('table tbody tr');
  const allRowCount = await allRows.count();
  const matchingEmployeesBeforeFilter = [];

  for (let i = 0; i < allRowCount; i++) {
    const row = allRows.nth(i);
    const validFromText = await row.locator('td').nth(3).textContent(); // Valid From column only

    if (validFromText.includes(targetDateText)) {
      const employeeName = await row.locator('td').first().textContent();
      matchingEmployeesBeforeFilter.push(employeeName.trim());
    }
  }

  console.log(`BEFORE FILTER: Found ${matchingEmployeesBeforeFilter.length} row(s) with Valid From = "${targetDateText}":`);
  matchingEmployeesBeforeFilter.forEach(name => console.log(`  - ${name}`));

  expect(matchingEmployeesBeforeFilter.length,
    `No rows with Valid From "${targetDateText}" were found in the unfiltered table. Update proxyData.filterTest.bugCheckDate to a date that currently has assignments.`
  ).toBeGreaterThan(0);

  await page.screenshot({ path: 'screenshots/bug-before-filter.png', fullPage: true });

  // STEP 2: Apply the date filter
  await page.locator('input[type="date"]').fill(targetDateFilterValue);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'screenshots/bug-after-filter.png', fullPage: true });

  // STEP 3: Check filtered result
  const filteredRows = page.locator('table tbody tr');
  const filteredRowCount = await filteredRows.count();
  const firstFilteredRowText = filteredRowCount > 0 ? await filteredRows.first().textContent() : '';
  const noResultsShown = firstFilteredRowText.includes('No proxy assignments found');

  if (noResultsShown) {
    console.log(`❌ BUG CONFIRMED: Filter shows "No proxy assignments found" despite ${matchingEmployeesBeforeFilter.length} known matching Valid From date(s):`);
    matchingEmployeesBeforeFilter.forEach(name => console.log(`  - ${name}`));
  }

  // STEP 4: Assert
  expect(noResultsShown,
    `BUG: Date filter for "${targetDateFilterValue}" incorrectly shows "No proxy assignments found", ` +
    `even though ${matchingEmployeesBeforeFilter.length} assignment(s) with Valid From = this date exist: ${matchingEmployeesBeforeFilter.join(', ')}. ` +
    `See screenshots: bug-before-filter.png vs bug-after-filter.png`
  ).toBe(false);
});



});