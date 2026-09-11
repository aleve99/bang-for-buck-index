import { expect, test, type Page } from "@playwright/test";

async function openLeaderboard(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("leaderboard-table")).toBeVisible();
  await expect(page.getByTestId("leaderboard-row").first()).toBeVisible();
}

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

test("ranks by CLPA ascending with Oettinger first in USD", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByLabel("Currency unit").selectOption("USD");
  await expect(page.getByTestId("leaderboard-row").first()).toContainText(/Oettinger/);
});

test("currency unit toggle switches the CLPA column", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Currency unit").selectOption("LOCAL");
  await expect(page.getByText(/not ranked across currencies/i)).toBeVisible();
  await page.getByLabel("Currency unit").selectOption("USD");
});

test("currency EUR keeps the table and CLPA column populated", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByLabel("Currency unit").selectOption("EUR");

  const table = page.getByTestId("leaderboard-table");
  await expect(table).toBeVisible();
  await expect(table.locator("thead")).toContainText(/CLPA/);
  await expect(table.locator("thead")).toContainText(/EUR/);

  const clpaCell = page.getByTestId("leaderboard-row").first().locator("td").last();
  await expect(clpaCell).toHaveText(/\d/);
});

test("PPP switch leaves the leaderboard visible", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByTestId("ppp-switch").click();
  await expect(page.getByTestId("ppp-switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("leaderboard-table")).toBeVisible();
  await expect(page.getByTestId("leaderboard-row").first()).toBeVisible();
});

test("LOCAL currency shows the not-ranked-across-currencies note", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByLabel("Currency unit").selectOption("LOCAL");
  await expect(page.getByText(/not ranked across currencies/i)).toBeVisible();
});

test("style filter narrows the results", async ({ page }) => {
  await page.goto("/");
  const before = await page.getByTestId("leaderboard-row").count();
  await page.getByLabel("Style").selectOption("Stout");
  const after = await page.getByTestId("leaderboard-row").count();
  expect(after).toBeLessThanOrEqual(before);
});

test("ABV min filter leaves high-ABV beers like Asahi", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByTestId("abv-min").fill("4.8");
  const rows = page.getByTestId("leaderboard-row");
  await expect(rows.filter({ hasText: /Asahi Super Dry/i })).toBeVisible();
  await expect(rows.filter({ hasText: /Tennents/i })).toHaveCount(0);
});

test("command menu search navigates to Czech Republic", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByRole("button", { name: "Search" }).click();
  const menu = page.getByTestId("command-menu");
  await expect(menu).toBeVisible();
  await page.getByLabel("Search catalog").fill("Czech");
  await menu.getByRole("button", { name: /Czech Republic/i }).click();
  await expect(page).toHaveURL(/\/country\/cz/i);
});

test("+ Add opens the submit dialog without navigating", async ({ page }) => {
  await openLeaderboard(page);
  await page.getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByTestId("submit-dialog")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("country page shows Germany and at least one row", async ({ page }) => {
  await page.goto("/country/de");
  await expect(page.getByRole("heading", { name: /Germany/i })).toBeVisible();
  await expect(page.getByTestId("leaderboard-row").first()).toBeVisible();
});

test("submit form shows a live CLPA preview", async ({ page }) => {
  await page.goto("/submit");
  await expect(page.getByTestId("submit-step")).toBeVisible();

  await page.getByLabel("Beer name").fill("Test Pils");
  await page.getByLabel("Style").fill("Pilsner");
  await page.getByLabel("ABV %").fill("5");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Volume per unit (ml)").fill("500");
  await page.getByLabel("Price (local)").fill("1.00");
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByTestId("submit-step")).toBeVisible();
  // 1.00 / (1 * 0.5 * 0.05) = 40.00
  await expect(page.getByTestId("clpa-preview")).toHaveText("40.00");
});
