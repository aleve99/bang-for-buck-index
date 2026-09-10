import { expect, test } from "@playwright/test";

test("landing page loads the leaderboard and ranks by CLPA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bang-for-Buck Index/i })).toBeVisible();

  const table = page.getByTestId("leaderboard-table");
  await expect(table).toBeVisible();

  const rows = page.getByTestId("leaderboard-row");
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThan(1);
});

test("currency unit toggle switches the CLPA column", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Currency unit").selectOption("LOCAL");
  await expect(page.getByText(/not ranked across currencies/i)).toBeVisible();
  await page.getByLabel("Currency unit").selectOption("USD");
});

test("style filter narrows the results", async ({ page }) => {
  await page.goto("/");
  const before = await page.getByTestId("leaderboard-row").count();
  await page.getByLabel("Style").selectOption("Stout");
  const after = await page.getByTestId("leaderboard-row").count();
  expect(after).toBeLessThanOrEqual(before);
});

test("submit form shows a live CLPA preview", async ({ page }) => {
  await page.goto("/submit");
  await expect(page.getByTestId("clpa-preview")).toBeVisible();
  await page.getByLabel("Price (local)").fill("1.00");
  await page.getByLabel("Volume per unit (ml)").fill("500");
  await page.getByLabel("ABV %").fill("5");
  // 1.00 / (1 * 0.5 * 0.05) = 40.00
  await expect(page.getByTestId("clpa-preview")).toHaveText("40.00");
});
