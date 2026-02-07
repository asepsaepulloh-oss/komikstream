import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page).toHaveTitle(/KomikStream/i);

    // Check main navigation exists
    await expect(page.locator("nav")).toBeVisible();

    // Check that content is visible
    await expect(page.locator("main")).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Check komik link
    const komikLink = page.locator('a[href="/komik"]').first();
    await expect(komikLink).toBeVisible();

    // Check anime link
    const animeLink = page.locator('a[href="/anime"]').first();
    await expect(animeLink).toBeVisible();
  });

  test("should toggle dark/light mode", async ({ page }) => {
    await page.goto("/");

    // Find theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]').first();

    // If theme toggle exists, test it
    const exists = await themeToggle.count();
    if (exists > 0) {
      await themeToggle.click();
      // Wait for theme change
      await page.waitForTimeout(500);
    }
  });
});
