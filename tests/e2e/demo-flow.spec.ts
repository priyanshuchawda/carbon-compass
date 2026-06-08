import { expect, test } from "@playwright/test";

test("navigates from landing to dashboard and action plan", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /view demo dashboard/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /your carbon compass dashboard/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/monthly footprint/i).first()).toBeVisible();
  await expect(
    page.getByRole("region", { name: /category breakdown/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /what-if simulator/i }),
  ).toContainText(/estimated saving/i);

  await page.getByRole("link", { name: /open full action plan/i }).click();
  await expect(page).toHaveURL(/\/actions$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /weekly action plan/i }),
  ).toBeVisible();
  await expect(page.getByRole("article").first()).toContainText(
    /replace 2 short fuel trips/i,
  );
});
