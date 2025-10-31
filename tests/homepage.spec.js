import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Tests for index.html functionality
 */

test.describe('Homepage - Basic Layout', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vinyl Cabinet/);
  });

  test('should display header with title and search', async ({ page }) => {
    await page.goto('/');
    
    // Check header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check title
    const title = page.locator('h1');
    await expect(title).toContainText('VINYL CABINET');
    
    // Check search input
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /SEARCH YOUR COLLECTION/i);
  });

  test('should hide header on scroll down', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('#header');
    
    // Initially visible
    await expect(header).not.toHaveClass(/hidden/);
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500); // Wait for scroll animation
    
    // Should be hidden
    await expect(header).toHaveClass(/hidden/);
  });
});

test.describe('Homepage - Data Loading', () => {
  test('should load and display record categories', async ({ page }) => {
    await page.goto('/');
    
    // Wait for data to load
    await page.waitForSelector('.section-row', { timeout: 5000 });
    
    // Check that at least one section row exists
    const sections = page.locator('.section-row');
    await expect(sections).toHaveCount(5); // Based on records.json structure
  });

  test('should display section titles', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.section-title', { timeout: 5000 });
    
    const sectionTitles = page.locator('.section-title');
    await expect(sectionTitles.first()).toBeVisible();
  });

  test('should display vinyl cards in rows', async ({ page }) => {
    await page.goto('/');
    
    // Wait for cards to load
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const cards = page.locator('.vinyl-card');
    const count = await cards.count();
    
    // Should have multiple cards
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Homepage - Vinyl Cards', () => {
  test('should display card information', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const firstCard = page.locator('.vinyl-card').first();
    
    // Check card elements
    await expect(firstCard.locator('.card-title')).toBeVisible();
    await expect(firstCard.locator('.card-artist')).toBeVisible();
    await expect(firstCard.locator('.card-meta')).toBeVisible();
  });

  test('should show vinyl disc on hover', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const firstCard = page.locator('.vinyl-card').first();
    const vinylDisc = firstCard.locator('.vinyl-disc');
    
    // Hover over card
    await firstCard.hover();
    
    // Wait for animation
    await page.waitForTimeout(300);
    
    // Vinyl disc should be visible/animated
    await expect(vinylDisc).toBeVisible();
  });

  test('should navigate to detail page on card click', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    // Click first card
    await page.locator('.vinyl-card').first().click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/detail\.html\?id=/);
  });
});

test.describe('Homepage - View All Button', () => {
  test('should display view all buttons', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.view-all-btn', { timeout: 5000 });
    
    const viewAllButtons = page.locator('.view-all-btn');
    const count = await viewAllButtons.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to filter page on view all click', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.view-all-btn', { timeout: 5000 });
    
    // Click first view all button
    await page.locator('.view-all-btn').first().click();
    
    // Should navigate to filter page with query params
    await expect(page).toHaveURL(/filter\.html\?type=.+&value=.+/);
  });
});

test.describe('Homepage - Scroll Progress', () => {
  test('should show scroll progress indicator', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.section-row', { timeout: 5000 });
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));
    
    // Wait for progress indicator to appear
    await page.waitForTimeout(500);
    
    const scrollProgress = page.locator('#scrollProgress');
    await expect(scrollProgress).toHaveClass(/visible/);
  });

  test('should update current section number on scroll', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.section-row', { timeout: 5000 });
    
    const currentSection = page.locator('#currentSection');
    
    // Initially should be 1
    await expect(currentSection).toHaveText('1');
    
    // Scroll to second section
    const secondSection = page.locator('.section-row').nth(1);
    await secondSection.scrollIntoViewIfNeeded();
    
    await page.waitForTimeout(500);
    
    // Should update to 2
    await expect(currentSection).toHaveText('2');
  });
});

test.describe('Homepage - Search Input', () => {
  test('should accept text input in search field', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('#searchInput');
    
    await searchInput.fill('Pink Floyd');
    await expect(searchInput).toHaveValue('Pink Floyd');
  });

  test('should log search term to console', async ({ page }) => {
    const consoleLogs = [];
    
    // Set up console listener before page load
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    await page.goto('/');
    
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('Beatles');
    
    // Trigger input event
    await searchInput.press('Enter');
    
    // Wait a moment for console log
    await page.waitForTimeout(300);
    
    // Should log the search (based on current implementation)
    const hasSearchLog = consoleLogs.some(log => log.toLowerCase().includes('beatles') || log.toLowerCase().includes('searching'));
    expect(hasSearchLog).toBe(true);
  });
});

test.describe('Homepage - Responsive Design', () => {
  test('should adapt header layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const header = page.locator('.header-content');
    await expect(header).toBeVisible();
    
    // On mobile, header should have flex-direction: column
    const flexDirection = await header.evaluate(el => 
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  });

  test('should display cards correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForSelector('.vinyl-card', { timeout: 5000 });
    
    const card = page.locator('.vinyl-card').first();
    await expect(card).toBeVisible();
    
    // Cards should still be clickable on mobile
    await card.click();
    await expect(page).toHaveURL(/detail\.html\?id=/);
  });
});
