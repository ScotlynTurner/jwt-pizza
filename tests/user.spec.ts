import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  // make sure changes are persistent
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});


test('admin can see a list of users', async ({ page }) => {
  const email = `a@jwt.com`;
  const password = `admin`;
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByRole('main')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('main')).toContainText('Users');
  
  // await page.getByRole('textbox', { name: 'Filter users' }).click();
  // await page.getByRole('textbox', { name: 'Filter users' }).fill('Delete');
  // await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Delete' }).nth(1).click();

  await expect(page.getByRole('heading')).toContainText('You Are About To Delete A User');
  await page.getByRole('button', { name: 'Delete' }).click(); // confirm
  await expect(page.getByText('delete_me@test.com')).not.toBeVisible();
});