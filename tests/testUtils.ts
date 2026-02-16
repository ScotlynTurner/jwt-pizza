import { expect, Page } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = {
        'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
        'f@jwt.com': { id: '4', name: 'Frank Lee', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Franchisee }] },
        'a@jwt.com': { id: '5', name: 'Addy Minn', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
    };
  
    // Login or Logout
    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();
        
        // Register new user
        if (method === 'POST') {
            const req = route.request().postDataJSON() || {};
        
            // Check if user already exists
            if (validUsers[req.email]) {
              await route.fulfill({
                status: 409,
                json: { error: 'User already exists' },
              });
              return;
            }
        
            // Create new user
            const newUser: User = {
              id: Date.now().toString(),
              name: req.name,
              email: req.email,
              password: req.password,
              roles: [{ role: Role.Diner }],
            };
        
            validUsers[req.email] = newUser;
            loggedInUser = newUser;
        
            await route.fulfill({
              json: {
                user: newUser,
                token: 'abcdef',
              },
            });
            return;
          }

        // Authorize login for the given user
        if (method === 'PUT') {
            const loginReq = route.request().postDataJSON() || {};
            const user = validUsers[loginReq.email];
      
            if (!user || user.password !== loginReq.password) {
                await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
                return;
            }
            loggedInUser = user;
      
            await route.fulfill({
                json: {
                user: loggedInUser,
                token: 'abcdef',
                },
            });
            return;
        }
      
        // Logout current user
        if (method === 'DELETE') {
          loggedInUser = undefined;
          await route.fulfill({ status: 200 });
          return;
        }
    });     
    
    // Fetch current user (used for auto-login on page refresh)
    await page.route('*/**/api/user/me', async (route) => {
        if (!loggedInUser) {
          await route.fulfill({
            status: 401,
            json: { error: 'Unauthorized' },
          });
          return;
        }
      
        await route.fulfill({
          json: {
            id: loggedInUser.id,
            name: loggedInUser.name,
            email: loggedInUser.email,
            roles: loggedInUser.roles,
          },
        });
    });
      
  
    // A standard menu
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        {
          id: 1,
          title: 'Margarita',
          image: 'pizza1.png',
          price: 0.0038,
          description: 'A garden of delight',
        },
        {
          id: 2,
          title: 'Pepperoni',
          image: 'pizza2.png',
          price: 0.0042,
          description: 'Spicy treat',
        },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    // Standard franchises and stores
    let franchises = [
        {
          id: 2,
          name: 'pizzaPocket',
          admins: [{ id: 4, name: 'Frank Lee', email: 'f@jwt.com' }],
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      
      await page.route(/\/api\/franchise.*/, async (route) => {
        const method = route.request().method();
        const url = new URL(route.request().url());
        const path = url.pathname;
      
        // Get all franchises
        if (method === 'GET' && path === '/api/franchise') {
          await route.fulfill({
            json: {
              franchises,
              more: false,
            },
          });
          return;
        }
      
        // Get a user's franchises
        const userMatch = path.match(/\/api\/franchise\/(\d+)$/);
        if (method === 'GET' && userMatch) {
          const userId = Number(userMatch[1]);
      
          const userFranchises = franchises.filter((f) =>
            f.admins?.some((a) => a.id === userId)
          );
      
          await route.fulfill({
            json: userFranchises,
          });
          return;
        }
      
        // Create franchise
        if (method === 'POST' && path === '/api/franchise') {
          const req = route.request().postDataJSON();
      
          const newFranchise = {
            id: Date.now(),
            name: req.name,
            admins: req.admins ?? [],
            stores: [],
          };
      
          franchises.push(newFranchise);
      
          await route.fulfill({ json: newFranchise });
          return;
        }
      
        // Delete franchise
        const deleteMatch = path.match(/\/api\/franchise\/(\d+)$/);
        if (method === 'DELETE' && deleteMatch) {
          const franchiseId = Number(deleteMatch[1]);
      
          franchises = franchises.filter((f) => f.id !== franchiseId);
      
          await route.fulfill({
            json: { message: 'franchise deleted' },
          });
          return;
        }
      
        // Create store
        const storeCreateMatch = path.match(/\/api\/franchise\/(\d+)\/store$/);
        if (method === 'POST' && storeCreateMatch) {
          const franchiseId = Number(storeCreateMatch[1]);
          const req = route.request().postDataJSON();
      
          const franchise = franchises.find((f) => f.id === franchiseId);
      
          const newStore = {
            id: Date.now(),
            name: req.name,
            totalRevenue: 0,
          };
      
          franchise?.stores.push(newStore);
      
          await route.fulfill({ json: newStore });
          return;
        }
      
        // Delete store
        const storeDeleteMatch = path.match(
          /\/api\/franchise\/(\d+)\/store\/(\d+)$/
        );
      
        if (method === 'DELETE' && storeDeleteMatch) {
          const franchiseId = Number(storeDeleteMatch[1]);
          const storeId = Number(storeDeleteMatch[2]);
      
          const franchise = franchises.find((f) => f.id === franchiseId);
      
          if (franchise) {
            franchise.stores = franchise.stores.filter(
              (s) => s.id !== storeId
            );
          }
      
          await route.fulfill({
            json: { message: 'store deleted' },
          });
          return;
        }
    });        
  
    let currentOrder: any = null;
    // Pizza Orders
    await page.route('*/**/api/order', async (route) => {
        const method = route.request().method();
      
        // Create order
        if (method === 'POST') {
          currentOrder = route.request().postDataJSON() || {};
      
          await route.fulfill({
            json: {
              order: { ...currentOrder, id: 23 },
              jwt: 'eyJpYXQ',
            },
          });
          return;
        }
      
        // Fetch current order (needed after login)
        if (method === 'GET') {
          await route.fulfill({
            json: currentOrder ?? [],
          });
          return;
        }
    });
           
  
    await page.goto('/');
  }
  
export async function diner_login(page: Page) {
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
}