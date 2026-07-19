async function login(page, username, password) {
  await page.getByRole('textbox', { name: 'Enter username or employee' }).fill(username);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

module.exports = { login };