import { expect, test } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_SECRET ?? "dev-admin-secret";

async function signInAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("admin route redirects anonymous users to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: /^Admin$/ })).toBeVisible();
});

test("crowdsourced submit stays off the board until admin verifies", async ({ page }) => {
  const beerName = `QA Hop ${Date.now()}`;

  await page.goto("/submit");
  await page.getByLabel("Beer name").fill(beerName);
  await page.getByLabel("Style").fill("Pilsner");
  await page.getByLabel("ABV %").fill("5");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Volume per unit (ml)").fill("500");
  await page.getByLabel("Price (local)").fill("1.00");
  await page.getByTestId("receipt-input").setInputFiles("tests/e2e/fixtures/receipt.png");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByTestId("receipt-preview")).toBeVisible();
  await page.getByRole("button", { name: "Submit price" }).click();
  await expect(page.getByTestId("submit-result")).toContainText(/pending verification/i);

  await page.goto("/");
  await expect(page.getByTestId("leaderboard-row").filter({ hasText: beerName })).toHaveCount(0);

  await signInAdmin(page);
  const pending = page.getByTestId("pending-row").filter({ hasText: beerName });
  await expect(pending).toBeVisible();
  await expect(pending.getByTestId("receipt-thumb")).toBeVisible();
  await pending.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByTestId("pending-row").filter({ hasText: beerName })).toHaveCount(0);

  await page.goto("/");
  await expect(page.getByTestId("leaderboard-row").filter({ hasText: beerName })).toBeVisible();
});
