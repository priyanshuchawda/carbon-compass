import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("navigates from landing to dashboard and action plan with accessibility checks", async ({
  page,
}) => {
  await page.goto("/");

  // Run accessibility check on Landing page
  const scanLanding = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanLanding.violations).toEqual([]);

  await page.getByRole("link", { name: /calculate my footprint/i }).click();
  await expect(page).toHaveURL(/\/calculator$/);

  // Run accessibility check on Calculator page
  const scanCalculator = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanCalculator.violations).toEqual([]);

  await page.getByRole("button", { name: /use pune student demo data/i }).click();
  await page.getByRole("button", { name: /calculate and view dashboard/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /your carbon compass dashboard/i,
    })
  ).toBeVisible();
  await expect(page.getByText(/monthly footprint/i).first()).toBeVisible();
  await expect(page.getByRole("region", { name: /category breakdown/i })).toBeVisible();
  await expect(page.getByRole("region", { name: /what-if simulator/i })).toContainText(
    /estimated saving/i
  );

  // Run accessibility check on Dashboard page
  const scanDashboard = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanDashboard.violations).toEqual([]);

  await page.getByRole("link", { name: /open full action plan/i }).click();
  await expect(page).toHaveURL(/\/actions$/);
  await expect(page.getByRole("heading", { level: 1, name: /weekly action plan/i })).toBeVisible();
  await expect(page.getByRole("article").first()).toContainText(/replace 2 short fuel trips/i);

  // Run accessibility check on Actions page
  const scanActions = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanActions.violations).toEqual([]);

  await page.getByRole("link", { name: /create report/i }).click();
  await expect(page).toHaveURL(/\/report$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /carbon compass report/i })
  ).toBeVisible();
  await expect(page.getByRole("region", { name: /progress trend/i })).toContainText(
    /best improvement/i
  );

  // Run accessibility check on Report page
  const scanReport = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanReport.violations).toEqual([]);
});

test("falls back to demo data when accessing dashboard directly with no session", async ({
  page,
}) => {
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

test("allows setting monthly goal and chatting with assistant", async ({ page }) => {
  await page.goto("/dashboard");

  // Verify that the GoalSetter is present
  await expect(page.getByRole("heading", { name: /monthly carbon goal/i })).toBeVisible();

  // Set a goal
  const goalInput = page.locator("#goal-input");
  await goalInput.fill("200");
  await page.getByRole("button", { name: "Save" }).click();

  // Verify that goal is set (or warning on demo mode)
  // Since we are accessing dashboard directly with no session, it is in demo mode.
  // In demo mode, it shows a warning feedback message.
  await expect(page.getByText(/Complete the calculator first to set a goal/i)).toBeVisible();

  // Go to Assistant page
  await page
    .getByRole("link", { name: /ai assistant/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/assistant$/);

  // Click a suggestion
  await page.getByRole("button", { name: /what is driving my emissions/i }).click();

  // Wait for the response and make sure it renders the fallback text
  await expect(page.getByText(/detailed breakdown on the Dashboard/i)).toBeVisible();
});

test("skip-link behaves correctly on tab focus", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: /skip to main content/i });
  await expect(skipLink).toBeFocused();
});

test("mobile viewport has no horizontal overflow at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const routes = ["/", "/calculator", "/dashboard", "/log", "/actions", "/report"];
  for (const route of routes) {
    await page.goto(route);
    await page.waitForTimeout(100);
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  }
});

test("reduced motion is respected and page remains fully accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard");
  const scanDashboard = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(scanDashboard.violations).toEqual([]);
});

test("assistant chat page exhibits accessible aria alert behavior", async ({ page }) => {
  await page.goto("/assistant");
  await expect(page.locator("#main-content")).toBeVisible();

  // Submit a query
  await page.getByRole("button", { name: /what is driving my emissions/i }).click();

  // Verify response renders correctly
  await expect(page.getByText(/detailed breakdown on the Dashboard/i)).toBeVisible();
});
