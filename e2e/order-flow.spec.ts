import { test, expect } from '@playwright/test';

test('primary journey: browse restaurants CTA from home', async ({ page }) => {
	await page.goto('/');
	const cta = page.getByRole('link', { name: /order now/i });
	await expect(cta).toBeVisible();
	await cta.click();
	await expect(page).toHaveURL(/\/restaurants/);
});

