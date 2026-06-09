import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("navigates from landing to dashboard and action plan with accessibility checks", async ({ page }) => {
  await page.goto("/");

  // Run accessibility check on Landing page
  const scanLanding = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scanLanding.violations).toEqual([]);

  await page.getByRole("link", { name: /calculate my footprint/i }).click();
  await expect(page).toHaveURL(/\/calculator$/);

  // Run accessibility check on Calculator page
  const scanCalculator = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scanCalculator.violations).toEqual([]);

  await page.getByRole("button", { name: /use pune student demo data/i }).click();
  await page.getByRole("button", { name: /calculate and view dashboard/i }).click();
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

  // Run accessibility check on Dashboard page
  const scanDashboard = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scanDashboard.violations).toEqual([]);

  await page.getByRole("link", { name: /open full action plan/i }).click();
  await expect(page).toHaveURL(/\/actions$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /weekly action plan/i }),
  ).toBeVisible();
  await expect(page.getByRole("article").first()).toContainText(
    /replace 2 short fuel trips/i,
  );

  // Run accessibility check on Actions page
  const scanActions = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scanActions.violations).toEqual([]);

  await page.getByRole("link", { name: /create report/i }).click();
  await expect(page).toHaveURL(/\/report$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /carbon compass report/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: /progress trend/i }),
  ).toContainText(/best improvement/i);

  // Run accessibility check on Report page
  const scanReport = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(scanReport.violations).toEqual([]);
});

test("falls back to demo data when accessing dashboard directly with no session", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  
  // Verify that the demo alert banner is displayed
  await expect(page.getByText(/showing demo data/i)).toBeVisible();
  
  // Verify that a demo profile is loaded (e.g. Pune)
  await expect(page.getByText(/pune · student/i)).toBeVisible();
  
  // Verify that dashboard cards are still fully loaded
  await expect(page.getByText(/monthly footprint/i).first()).toBeVisible();
  await expect(page.getByText(/eco score/i).first()).toBeVisible();
});
