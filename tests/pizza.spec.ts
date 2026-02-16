import { test, expect } from 'playwright-test-coverage';
import { basicInit, diner_login } from './testUtils';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  const combo = page.getByRole('combobox');
  await combo.selectOption({ label: 'Lehi' });

  await page.getByText('Margarita').click();
  await page.getByText('Pepperoni').click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await diner_login(page);

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Margarita');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
  await expect(page.getByRole('main').getByRole('img')).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await diner_login(page);
  
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('diner dashboard and other single pages', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await diner_login(page);

  // Franchise
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('alert')).toContainText('If you are already a franchisee, pleaseloginusing your franchise account');

  // History
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');

  // Dashboard
  await page.getByRole('link', { name: 'KC', exact: true }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');

  // About
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('register new user', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Lil Ceasar');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('lc@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('pizza');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
});


test('franchisee can add and close stores', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page.locator('#navbar-dark')).toContainText('Franchise');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.goto('http://localhost:5173/franchise-dashboard');
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('Test Store');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody')).toContainText('Test Store');
  await page.getByRole('row', { name: 'Test Store 0 ₿ Close' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('admin dashboard shows for admin', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  

  // await page.getByRole('button', { name: 'Add Franchise' }).click();
  // await page.getByRole('textbox', { name: 'franchise name' }).click();
  // await page.getByRole('textbox', { name: 'franchise name' }).fill('tester');
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('t@jwt@gmail.com');
  // await page.getByRole('button', { name: 'Create' }).click();
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('t@jwt.com');
  // await page.getByRole('button', { name: 'Create' }).click();
});