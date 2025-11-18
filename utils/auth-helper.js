/**
 * Authentication helper utilities for password-protected sites
 */
export class AuthHelper {
     /**
      * Authenticate with Shopify password-protected store
      * @param {Page} page - Playwright page object
      * @param {string} passwordUrl - URL to the password page (e.g., 'https://store.myshopify.com/password')
      * @param {string} password - Store password
      * @param {Object} options - Additional options
      * @param {number} options.timeout - Timeout in milliseconds (default: 60000)
      * @returns {Promise<void>}
      */
     static async authenticateShopifyStore(page, passwordUrl, password, options = {}) {
          const timeout = options.timeout || 60000;

          // Navigate to password page
          await page.goto(passwordUrl, {
               waitUntil: 'domcontentloaded',
               timeout: timeout
          });

          // Wait for password input field
          await page.waitForSelector('input[type="password"]', { timeout: 10000 });

          // Fill in the password
          await page.fill('input[type="password"]', password);

          // Submit the form
          await page.click('button[type="submit"]');

          // Wait for authentication to complete
          await page.waitForLoadState('networkidle');
     }

     /**
      * Check if current page is a password-protected page
      * @param {Page} page - Playwright page object
      * @returns {Promise<boolean>}
      */
     static async isPasswordPage(page) {
          try {
               const passwordInput = await page.locator('input[type="password"]');
               return await passwordInput.isVisible({ timeout: 2000 });
          } catch {
               return false;
          }
     }
}

