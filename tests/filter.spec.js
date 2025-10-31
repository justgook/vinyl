import { test, expect } from '@playwright/test';

/**
 * Filter Page E2E Tests
 * Tests for filter.html functionality
 */

test.describe('Filter Page - Basic Layout', () => {
  test('should load filter page with valid parameters', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await expect(page).toHaveTitle(/Vinyl Cabinet/);
  });

  test('should display back button', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Rock');
    
    const backButton = page.locator('.close-modal-btn');
    await expect(backButton).toBeVisible();
  });

  test('should navigate back to homepage on back button click', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=The%20Beatles');
    
    const backButton = page.locator('.close-modal-btn');
    await backButton.click();
    
    await expect(page).toHaveURL(/index\.html|\/$/);
  });
});

test.describe('Filter Page - Header Display', () => {
  test('should display filter type and value in header', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await page.waitForSelector('.filter-value', { timeout: 5000 });
    
    const value = page.locator('.filter-value');
    await expect(value).toBeVisible();
    
    // Should show filter information
    const headerText = await value.textContent();
    expect(headerText).toContain('Pink Floyd');
  });

  test('should display artist filter icon', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=The%20Beatles');
    
    await page.waitForSelector('.filter-type', { timeout: 5000 });
    
    const type = page.locator('.filter-type');
    const typeText = await type.textContent();
    
    // Should include artist emoji/icon
    expect(typeText).toMatch(/🎤|artist/i);
  });

  test('should display genre filter icon', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Rock');
    
    await page.waitForSelector('.filter-type', { timeout: 5000 });
    
    const type = page.locator('.filter-type');
    const typeText = await type.textContent();
    
    // Should include genre emoji/icon
    expect(typeText).toMatch(/🎸|genre/i);
  });

  test('should display year filter icon', async ({ page }) => {
    await page.goto('/filter.html?type=year&value=1973');
    
    await page.waitForSelector('.filter-type', { timeout: 5000 });
    
    const type = page.locator('.filter-type');
    const typeText = await type.textContent();
    
    // Should include year emoji/icon
    expect(typeText).toMatch(/📅|year/i);
  });

  test('should display label filter icon', async ({ page }) => {
    await page.goto('/filter.html?type=label&value=Columbia');
    
    await page.waitForSelector('.filter-type', { timeout: 5000 });
    
    const type = page.locator('.filter-type');
    const typeText = await type.textContent();
    
    // Should include label emoji/icon
    expect(typeText).toMatch(/🏷️|label/i);
  });
});

test.describe('Filter Page - Data Loading', () => {
  test('should load filtered records from JSON', async ({ page }) => {
    // Wait for response before navigation - filters load from /data/filters/
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/data/filters/') && response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    const jsonResponse = await responsePromise;
    expect(jsonResponse.status()).toBe(200);
  });

  test('should display filtered record cards', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Progressive%20Rock');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should display result count', async ({ page }) => {
    await page.goto('/filter.html?type=year&value=1973');
    
    await page.waitForSelector('.filter-count', { timeout: 5000 });
    
    const resultCount = page.locator('.filter-count');
    await expect(resultCount).toBeVisible();
    
    const countText = await resultCount.textContent();
    expect(countText).toMatch(/\d+/); // Should contain a number
  });
});

test.describe('Filter Page - Grid Layout', () => {
  test('should display cards in grid layout', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Rock');
    
    await page.waitForSelector('.records-grid', { timeout: 5000 });
    
    const grid = page.locator('.records-grid');
    await expect(grid).toBeVisible();
    
    // Check grid display (uses flex with wrap)
    const display = await grid.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(display).toBe('flex');
  });

  test('should display card information', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=The%20Beatles');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const firstCard = page.locator('.vinyl-card').first();
    
    // Check card components
    await expect(firstCard.locator('.album-cover')).toBeVisible();
    await expect(firstCard.locator('.card-title')).toBeVisible();
    await expect(firstCard.locator('.card-artist')).toBeVisible();
  });

  test('should hover effect on cards', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Rock');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const firstCard = page.locator('.vinyl-card').first();
    
    // Hover over card
    await firstCard.hover();
    await page.waitForTimeout(200);
    
    // Card should still be visible and interactive
    await expect(firstCard).toBeVisible();
  });
});

test.describe('Filter Page - Card Navigation', () => {
  test('should navigate to detail page on card click', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    // Click first card
    await page.locator('.vinyl-card').first().click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/detail\.html\?id=/);
  });

  test('should preserve filter context when returning from detail', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Jazz');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    // Click a card
    await page.locator('.vinyl-card').first().click();
    
    // Wait for detail page
    await page.waitForURL(/detail\.html\?id=/);
    
    // Go back
    await page.goBack();
    
    // Should return to same filter page
    await expect(page).toHaveURL(/filter\.html\?type=genre&value=Jazz/);
  });
});

test.describe('Filter Page - URL Parameter Handling', () => {
  test('should handle URL-encoded filter values', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await page.waitForSelector('.filter-value', { timeout: 5000 });
    
    const value = page.locator('.filter-value');
    const headerText = await value.textContent();
    
    // Should decode and display "Pink Floyd"
    expect(headerText).toContain('Pink Floyd');
  });

  test('should handle special characters in filter values', async ({ page }) => {
    await page.goto('/filter.html?type=label&value=Warner%20Bros.');
    
    await page.waitForSelector('.filter-value', { timeout: 5000 });
    
    const value = page.locator('.filter-value');
    await expect(value).toBeVisible();
  });

  test('should handle missing type parameter gracefully', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/filter.html?value=Rock');
    
    // Should handle gracefully (show error or redirect)
    await page.waitForTimeout(1000);
    
    // Page should not crash
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should handle missing value parameter gracefully', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/filter.html?type=artist');
    
    await page.waitForTimeout(1000);
    
    // Page should not crash
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe('Filter Page - Multiple Filter Types', () => {
  test('should filter by artist correctly', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    // Should have Pink Floyd records
    expect(count).toBeGreaterThan(0);
    
    // All cards should be by Pink Floyd
    const firstCardArtist = await cards.first().locator('.card-artist').textContent();
    expect(firstCardArtist).toContain('Pink Floyd');
  });

  test('should filter by genre correctly', async ({ page }) => {
    await page.goto('/filter.html?type=genre&value=Jazz');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by year correctly', async ({ page }) => {
    await page.goto('/filter.html?type=year&value=1973');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by label correctly', async ({ page }) => {
    await page.goto('/filter.html?type=label&value=Columbia');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Filter Page - Empty Results', () => {
  test('should handle filters with no results', async ({ page }) => {
    await page.goto('/filter.html?type=artist&value=NonexistentArtist123');
    
    // Wait for page to process the filter (may show error or "0 records")
    await page.waitForTimeout(2000);
    
    // Check if error message is shown or count shows 0
    const errorMessage = page.locator('.error');
    const hasError = await errorMessage.count();
    
    if (hasError > 0) {
      // Should show error message about no records found
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/no records found/i);
    } else {
      // Or should show 0 in count
      const resultCount = page.locator('.filter-count');
      const countText = await resultCount.textContent();
      expect(countText).toMatch(/0 record/i);
    }
  });
});

test.describe('Filter Page - Responsive Design', () => {
  test('should adapt grid layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/filter.html?type=genre&value=Rock');
    
    await page.waitForSelector('.records-grid', { timeout: 5000 });
    
    const grid = page.locator('.records-grid');
    await expect(grid).toBeVisible();
  });

  test('should make cards tappable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/filter.html?type=artist&value=Pink%20Floyd');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const firstCard = page.locator('.vinyl-card').first();
    await firstCard.click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/detail\.html\?id=/);
  });

  test('should display header correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/filter.html?type=genre&value=Jazz');
    
    await page.waitForSelector('.filter-value', { timeout: 5000 });
    
    const value = page.locator('.filter-value');
    await expect(value).toBeVisible();
  });
});

test.describe('Filter Page - Performance', () => {
  test('should load filter page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/filter.html?type=genre&value=Rock');
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load in reasonable time (< 3 seconds)
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large filter results efficiently', async ({ page }) => {
    // Test with a genre that might have many records
    await page.goto('/filter.html?type=genre&value=Rock');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    // Page should render without issues even with multiple results
    expect(count).toBeGreaterThan(0);
    
    // First and last cards should be visible/accessible
    await expect(cards.first()).toBeVisible();
  });
});
