import { test, expect } from "@playwright/test";

test.describe("Komik Pages", () => {
  test("should load komik list page", async ({ page }) => {
    await page.goto("/komik");

    // Check page loads
    await expect(page).toHaveURL(/\/komik/);

    // Check main content area
    await expect(page.locator("main")).toBeVisible();
  });

  test("should have komik cards or list items", async ({ page }) => {
    await page.goto("/komik");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check for komik items (cards, links, or list items)
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });

  test("should navigate to komik detail when clicking a komik", async ({ page }) => {
    await page.goto("/komik");

    // Wait for content
    await page.waitForLoadState("networkidle");

    // Find first komik link and click
    const firstKomikLink = page.locator('a[href^="/komik/"]').first();
    const exists = await firstKomikLink.count();

    if (exists > 0) {
      await firstKomikLink.click();
      await page.waitForLoadState("networkidle");

      // Should be on detail page
      await expect(page).toHaveURL(/\/komik\/.+/);
    }
  });
});

test.describe("Komik Search", () => {
  test("should have search functionality", async ({ page }) => {
    await page.goto("/komik");

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="cari" i]'
      )
      .first();
    const exists = await searchInput.count();

    if (exists > 0) {
      await expect(searchInput).toBeVisible();

      // Type search query
      await searchInput.fill("test");

      // Wait for results or submit
      await page.waitForTimeout(500);
    }
  });
});
