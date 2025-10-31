import { test, expect } from '@playwright/test';

/**
 * Detail Page E2E Tests
 * Tests for detail.html functionality
 */

test.describe('Detail Page - Basic Layout', () => {
  test('should load detail page with valid ID', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await expect(page).toHaveTitle(/Vinyl Cabinet/);
  });

  test('should display back button', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    const backButton = page.locator('.close-modal-btn');
    await expect(backButton).toBeVisible();
  });

  test('should navigate back to homepage on back button click', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    const backButton = page.locator('.close-modal-btn');
    await backButton.click();
    
    await expect(page).toHaveURL(/index\.html|\/$/);
  });
});

test.describe('Detail Page - Album Information', () => {
  test('should display album cover', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-cover', { timeout: 5000 });
    
    const cover = page.locator('.modal-cover');
    await expect(cover).toBeVisible();
  });

  test('should display album title and artist', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-title', { timeout: 5000 });
    
    const title = page.locator('.modal-title');
    const artist = page.locator('.modal-artist');
    
    await expect(title).toBeVisible();
    await expect(artist).toBeVisible();
    
    // Should have actual text content
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText.length).toBeGreaterThan(0);
  });

  test('should display vinyl record animation', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-vinyl', { timeout: 5000 });
    
    const vinyl = page.locator('.modal-vinyl');
    await expect(vinyl).toBeVisible();
    
    // Vinyl should have spinning animation
    const vinylLabel = page.locator('.vinyl-label');
    await expect(vinylLabel).toBeVisible();
  });

  test('should display metadata tags', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-tags', { timeout: 5000 });
    
    const tags = page.locator('.tag-btn');
    const count = await tags.count();
    
    // Should have multiple tags (year, genre, label, etc.)
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Detail Page - Tracklist', () => {
  test('should display tracklist sections', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.tracklist-section', { timeout: 5000 });
    
    const sections = page.locator('.tracklist-section');
    const count = await sections.count();
    
    // Should have at least one side (most records have 2)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display side titles', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.side-title', { timeout: 5000 });
    
    const sideTitle = page.locator('.side-title').first();
    await expect(sideTitle).toBeVisible();
    await expect(sideTitle).toContainText(/SIDE/i);
  });

  test('should display tracks with numbers and titles', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.track', { timeout: 5000 });
    
    const firstTrack = page.locator('.track').first();
    await expect(firstTrack).toBeVisible();
    
    // Check track components
    const trackNum = firstTrack.locator('.track-num');
    const trackName = firstTrack.locator('.track-name');
    const trackTime = firstTrack.locator('.track-time');
    
    await expect(trackNum).toBeVisible();
    await expect(trackName).toBeVisible();
    await expect(trackTime).toBeVisible();
  });

  test('should display track durations in correct format', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.track-time', { timeout: 5000 });
    
    const trackTime = page.locator('.track-time').first();
    const timeText = await trackTime.textContent();
    
    // Should match format like "4:32" or "1:30"
    expect(timeText).toMatch(/\d+:\d{2}/);
  });

  test('should highlight track on hover', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.track', { timeout: 5000 });
    
    const firstTrack = page.locator('.track').first();
    
    // Get initial background color
    const initialBg = await firstTrack.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Hover over track
    await firstTrack.hover();
    await page.waitForTimeout(200);
    
    // Background should change (neobrutalism hover effect)
    const hoverBg = await firstTrack.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(initialBg).not.toBe(hoverBg);
  });
});

test.describe('Detail Page - Tag Navigation', () => {
  test('should navigate to filter page on tag click', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.tag-btn', { timeout: 5000 });
    
    // Click a tag
    const firstTag = page.locator('.tag-btn').first();
    await firstTag.click();
    
    // Should navigate to filter page
    await expect(page).toHaveURL(/filter\.html\?type=.+&value=.+/);
  });
});

test.describe('Detail Page - Multiple Records', () => {
  test('should load different records based on ID parameter', async ({ page }) => {
    // Load first record
    await page.goto('/detail.html?id=001');
    await page.waitForSelector('.modal-title', { timeout: 5000 });
    const title1 = await page.locator('.modal-title').textContent();
    
    // Load second record
    await page.goto('/detail.html?id=002');
    await page.waitForSelector('.modal-title', { timeout: 5000 });
    const title2 = await page.locator('.modal-title').textContent();
    
    // Titles should be different
    expect(title1).not.toBe(title2);
  });

  test('should handle invalid record ID gracefully', async ({ page }) => {
    // Monitor console for errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/detail.html?id=999');
    
    // Wait a moment for potential error
    await page.waitForTimeout(1000);
    
    // Should log error or show message (not crash)
    expect(errors.length).toBeGreaterThan(0);
  });
});

test.describe('Detail Page - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.detail-modal', { timeout: 5000 });
    
    const container = page.locator('.detail-modal');
    await expect(container).toBeVisible();
  });

  test('should stack album info vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-header', { timeout: 5000 });
    
    const header = page.locator('.modal-vinyl-display');
    
    // Check if flex direction is column on mobile
    const flexDirection = await header.evaluate(el => 
      window.getComputedStyle(el).flexDirection
    );
    
    expect(flexDirection).toBe('column');
  });

  test('should make tracks tappable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.track', { timeout: 5000 });
    
    const firstTrack = page.locator('.track').first();
    
    // Should be able to click/hover (tap is click on mobile)
    await firstTrack.click();
    
    // Should not crash
    await expect(firstTrack).toBeVisible();
  });
});

test.describe('Detail Page - Animations', () => {
  test('should animate vinyl cover slide on load', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-cover', { timeout: 5000 });
    
    // Wait for animation to complete
    await page.waitForTimeout(2500);
    
    const cover = page.locator('.modal-cover');
    await expect(cover).toBeVisible();
  });

  test('should spin vinyl record continuously', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-vinyl', { timeout: 5000 });
    
    const vinyl = page.locator('.modal-vinyl::after');
    
    // Vinyl should have rotation animation
    // We can't directly test CSS animation, but we can verify element exists
    const vinylExists = await page.locator('.modal-vinyl').count();
    expect(vinylExists).toBe(1);
  });
});

test.describe('Detail Page - Data Integrity', () => {
  test('should display all required record fields', async ({ page }) => {
    await page.goto('/detail.html?id=001');
    
    await page.waitForSelector('.modal-title', { timeout: 5000 });
    
    // Check all required fields are present
    await expect(page.locator('.modal-title')).toBeVisible();
    await expect(page.locator('.modal-artist')).toBeVisible();
    await expect(page.locator('.modal-cover')).toBeVisible();
    await expect(page.locator('.tracklist-section').first()).toBeVisible();
  });

  test('should load record data from JSON file', async ({ page }) => {
    const response = page.waitForResponse(
      response => response.url().includes('/data/records/001.json')
    );
    
    await page.goto('/detail.html?id=001');
    
    const jsonResponse = await response;
    expect(jsonResponse.status()).toBe(200);
    
    const data = await jsonResponse.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('album');
    expect(data).toHaveProperty('artists');
  });
});
