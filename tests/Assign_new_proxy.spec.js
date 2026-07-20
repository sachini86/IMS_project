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

  test('TC6 - Assign new proxy (One by one) and verify it appears in Current Proxy Assignments', async ({ page }) => {
    // Step 1: Navigate to Proxy Management
    const proxyCard = page.getByText('Proxy ManagementAssign and');
    await expect(proxyCard).toBeVisible({ timeout: 15000 });
    await proxyCard.click();

    await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

    // Step 2: Click "One by one" in Assignments section
    await page.getByRole('button', { name: 'One by one' }).click();

    // Step 3: Select employee from dropdown
    await page.locator('svg').nth(5).click();
    await page.getByRole('option', { name: proxyData.proxyAssignment.employeeName }).click();

    // Step 4: Select preset from dropdown
    await page.locator('form').getByRole('img').click();
    await page.getByText(proxyData.proxyAssignment.presetName).click();

    // Step 5: Verify permissions auto-filled based on preset selection
    await expect(page.getByRole('checkbox', { name: 'Intern Requests' })).toBeChecked();

    // Step 6: Fill Valid From / Valid Until date and time
    await page.getByRole('textbox').first().fill(proxyData.proxyAssignment.validFrom);
    await page.getByRole('textbox').nth(1).fill(proxyData.proxyAssignment.validUntil);

    // Step 7: Click Assign Proxy
    await page.getByRole('button', { name: 'Assign Proxy' }).click();

    // Step 8: Click Confirm Assignment
    await expect(page.getByRole('button', { name: 'Confirm Assignment' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Assignment' }).click();

    // Step 9: Verify the new row exists in Current Proxy Assignments
    await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();
    await expect(page.getByRole('cell', { name: proxyData.proxyAssignment.employeeCellText }).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'screenshots/proxy-assign-onebyone.png', fullPage: true });
  });

  test('TC7 - Bulk assign proxy to multiple employees and verify in Current Proxy Assignments', async ({ page }) => {
  const { bulkProxyAssignment } = proxyData;

  // Step 1: Navigate to Proxy Management
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  // Step 2: Click "Bulk assign"
  await page.getByRole('button', { name: 'Bulk assign' }).click();

  // Step 3: Select multiple employees
  await page.getByText(bulkProxyAssignment.employee1Text).click();
  await page.getByText(bulkProxyAssignment.employee2Text).click();

  // Step 4: Select preset
  await page.locator('form').getByRole('img').click();
  await page.getByText(bulkProxyAssignment.presetName).click();

  // Step 5: Fill Valid From / Valid Until
  await page.getByRole('textbox').nth(1).fill(bulkProxyAssignment.validFrom);
  await page.getByRole('textbox').nth(2).fill(bulkProxyAssignment.validUntil);

  // Step 6: Assign proxies in bulk
  await page.getByRole('button', { name: 'Assign Proxies in Bulk' }).click();

  // Step 7: Confirm bulk assignment
  await expect(page.getByRole('button', { name: 'Confirm Bulk Assignment' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm Bulk Assignment' }).click();

  // Step 8: Verify both employees appear in Current Proxy Assignments
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();
  await expect(page.getByRole('cell', { name: bulkProxyAssignment.employee1CellText }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('cell', { name: bulkProxyAssignment.employee2CellText }).first()).toBeVisible({ timeout: 10000 });

  await page.screenshot({ path: 'screenshots/proxy-assign-bulk.png', fullPage: true });
});

test('TC8 - Verify table row count matches "Showing X-Y of Z assignments" summary', async ({ page }) => {
  // Navigate to Proxy Management
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  // Go to Current Proxy Assignments
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();

  // Read the summary text, e.g. "Showing 1-20 of 41 assignments"
  const summaryLocator = page.getByText(/Showing \d+-\d+ of \d+ assignments/i);
  await expect(summaryLocator).toBeVisible({ timeout: 10000 });
  const summaryText = await summaryLocator.textContent();

  // Extract the numbers using regex
  const match = summaryText.match(/Showing (\d+)-(\d+) of (\d+) assignments/i);
  expect(match).not.toBeNull(); // fail early with a clear message if the text format ever changes

  const shownStart = parseInt(match[1], 10);
  const shownEnd = parseInt(match[2], 10);
  const totalCount = parseInt(match[3], 10);
  const expectedRowCount = shownEnd - shownStart + 1;

  // Count actual visible rows in the table body
  const actualRowCount = await page.locator('table tbody tr').count();

  // Log values for easy debugging in the report/console
  console.log(`Summary says: ${shownStart}-${shownEnd} of ${totalCount}`);
  console.log(`Expected row count: ${expectedRowCount}, Actual row count: ${actualRowCount}`);

  // Main assertion: rows shown on screen must match what the summary claims
  expect(actualRowCount).toBe(expectedRowCount);

  await page.screenshot({ path: 'screenshots/proxy-table-row-count.png', fullPage: true });
});

test('TC9 - Date filter should show assignments matching the selected date (currently failing)', async ({ page }) => {
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();

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


//----------------------------Button working verification------------------------------------------------------------------------

test('TC10-Permissions - Select all and Clear buttons work correctly', async ({ page }) => {
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Proxy Management' })).toBeVisible({ timeout: 15000 });

  const totalCheckboxes = await page.getByRole('checkbox').count();

  // --- Part 1: Select all ---
  await page.getByRole('button', { name: 'Select all' }).click();

  const checkedCountAfterSelectAll = await page.getByRole('checkbox', { checked: true }).count();
  console.log(`After Select All: ${checkedCountAfterSelectAll} of ${totalCheckboxes} checked`);
  expect(checkedCountAfterSelectAll).toBe(totalCheckboxes);
  await expect(page.getByText(`${totalCheckboxes} selected`)).toBeVisible();

  await page.screenshot({ path: 'screenshots/select-all-check.png', fullPage: true });

  // --- Part 2: Clear ---
  await page.getByRole('button', { name: 'Clear' }).click();

  const checkedCountAfterClear = await page.getByRole('checkbox', { checked: true }).count();
  console.log(`After Clear: ${checkedCountAfterClear} checked (should be 0)`);
  expect(checkedCountAfterClear).toBe(0);
  await expect(page.getByText('0 selected')).toBeVisible();

  await page.screenshot({ path: 'screenshots/clear-button-check.png', fullPage: true });
});

test('TC11 - TableActions - Reset, Refresh, and Disable buttons work correctly', async ({ page }) => {
  const proxyCard = page.getByText('Proxy ManagementAssign and');
  await expect(proxyCard).toBeVisible({ timeout: 15000 });
  await proxyCard.click();

  await expect(page).toHaveURL(/proxy-management/i, { timeout: 15000 });
  await page.getByRole('button', { name: 'Current Proxy Assignments' }).click();

  // --- Part 1: Reset ---
  await page.locator('input[type="date"]').fill('2026-07-14');
  await page.waitForTimeout(1000);
  await expect(page.locator('input[type="date"]')).toHaveValue('2026-07-14');

  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(1000);

  await expect(page.locator('input[type="date"]')).toHaveValue('');
  await expect(page.getByText('All Grades')).toBeVisible();

  await page.screenshot({ path: 'screenshots/reset-button-check.png', fullPage: true });

  // --- Part 2: Refresh ---
  const rowCountBeforeRefresh = await page.locator('table tbody tr').count();

  await page.getByRole('button', { name: 'Refresh' }).click();
  await page.waitForTimeout(1500);

  const rowCountAfterRefresh = await page.locator('table tbody tr').count();
  console.log(`Rows before refresh: ${rowCountBeforeRefresh}, after: ${rowCountAfterRefresh}`);
  expect(rowCountAfterRefresh).toBeGreaterThan(0);

  await page.screenshot({ path: 'screenshots/refresh-button-check.png', fullPage: true });

  // --- Part 3: Disable ---
  const activeRow = page.locator('table tbody tr').filter({ hasText: 'ACTIVE' }).first();
  await expect(activeRow).toBeVisible({ timeout: 10000 });

  const employeeName = (await activeRow.locator('td').first().textContent()).trim();
  console.log(`Testing Disable on: ${employeeName}`);

  await activeRow.getByRole('button', { name: 'Disable' }).click();
  await page.waitForTimeout(500);

  // Debug screenshot right after click - shows if a confirm dialog appeared
  await page.screenshot({ path: 'screenshots/debug-after-disable-click.png', fullPage: true });

  // Handle confirmation dialog if one appears
  const confirmButton = page.getByRole('button', { name: /confirm|yes|ok/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Confirmation dialog appeared - clicking confirm');
    await confirmButton.click();
  } else {
    console.log('No confirmation dialog appeared - Disable may act immediately');
  }

  await page.waitForTimeout(1500);

  const updatedRow = page.locator('table tbody tr').filter({ hasText: employeeName }).first();
  const updatedRowText = await updatedRow.textContent();
  console.log(`Row content after Disable attempt: ${updatedRowText}`);

  await page.screenshot({ path: 'screenshots/disable-button-check.png', fullPage: true });

  await expect(updatedRow).toContainText('DISABLED', { timeout: 10000 });
});





});