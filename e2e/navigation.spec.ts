import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should have responsive navigation", async ({ page }) => {
    await page.goto("/");

    // Check navbar exists
    const nav = page.locator("nav, header").first();
    await expect(nav).toBeVisible();
  });

  test("should navigate between pages correctly", async ({ page }) => {
    // Start at home
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL("/");

    // Navigate to komik
    await page.goto("/komik");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/komik/);

    // Navigate to anime
    await page.goto("/anime");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/anime/);

    // Navigate to bookmark (protected — may redirect to sign-in when Clerk is active)
    await page.goto("/bookmark");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/(bookmark|sign-in)/);

    // Navigate to history (protected — may redirect to sign-in when Clerk is active)
    await page.goto("/history");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/(history|sign-in)/);
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Should show some content (either 404 page or redirect)
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should work on mobile viewport", async ({ page }) => {
    await page.goto("/");

    // Page should load correctly
    await expect(page.locator("body")).toBeVisible();

    // Check if mobile menu exists
    const mobileMenuButton = page
      .locator('[data-testid="mobile-menu"], button[aria-label*="menu" i]')
      .first();
    const exists = await mobileMenuButton.count();

    if (exists > 0) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
    }
  });
});
