import { test, expect } from '@playwright/test';
import { PlanningPage } from '../pages/PlanningPage';
import { BudgetPage } from '../pages/BudgetPage';

const TEST_EMAIL = 'planning-test@example.com';
const TEST_PASSWORD = 'password123';

test.describe('What-If Planner', () => {
  let planningPage: PlanningPage;

  test.beforeEach(async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.loginAndNavigateToBudget(TEST_EMAIL, TEST_PASSWORD);

    planningPage = new PlanningPage(page);
    await planningPage.goto();
    await planningPage.waitForPlannerLoad();
  });

  test('should display planner page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('What-If Planner');
  });

  test('should show summary cards', async () => {
    const income = await planningPage.getMonthlyIncome();
    expect(income).toBeTruthy();

    const need = await planningPage.getTotalMonthlyNeed();
    expect(need).toBeTruthy();
  });

  test('should simulate income override', async ({ page }) => {
    await planningPage.simulateIncome('8000');
    await page.waitForTimeout(500);

    const income = await planningPage.getMonthlyIncome();
    expect(income).toContain('8,000');
  });

  test('should clear income override', async ({ page }) => {
    await planningPage.simulateIncome('10000');
    await page.waitForTimeout(300);

    await planningPage.clearIncomeOverride();
    await page.waitForTimeout(500);

    const income = await planningPage.getMonthlyIncome();
    expect(income).toBeTruthy();
  });

  test('should edit planned amounts using table inputs', async ({ page }) => {
    const firstInput = page.locator('//table//tbody//tr[1]//td[3]//input');
    await firstInput.fill('200');
    await page.waitForTimeout(500);

    const value = await firstInput.inputValue();
    expect(value).toBe('200');
  });

  test('should show delta for modified categories', async ({ page }) => {
    const input = page.locator('table > tbody > tr:nth-child(1) > td:nth-child(3) input');
    await input.fill('300');
    await page.waitForTimeout(500);

    const delta = page.locator('table > tbody > tr:nth-child(1) > td:last-child');
    const deltaText = await delta.textContent();
    expect(deltaText).not.toBe('—');
  });

  test('should update surplus/shortfall on changes', async () => {
    await planningPage.simulateIncome('3000');
    const result = await planningPage.getSurplusOrShortfall();
    expect(result).toBeTruthy();
  });

  test('should access category rows by index', async ({ page }) => {
    const secondRowInput = planningPage.getPlannedInput(2);
    await secondRowInput.fill('150', { force: true });
    await page.waitForTimeout(500);

    const value = await secondRowInput.inputValue();
    expect(value).toBe('150');
  });

  test('should show table footer totals', async () => {
    const total = await planningPage.getTableTotal();
    expect(total).toBeTruthy();
  });

  test('should handle multiple planned edits', async ({ page }) => {
    const firstInput = page.locator('//table//tbody//tr[1]//td[3]//input');
    await firstInput.fill('100');
    await page.waitForTimeout(300);

    const secondInput = page.locator('//table//tbody//tr[2]//td[3]//input');
    await secondInput.fill('250');
    await page.waitForTimeout(300);

    const thirdInput = page.locator('table > tbody > tr:nth-child(3) > td:nth-child(3) input');
    await thirdInput.fill('175');
    await page.waitForTimeout(300);

    const total = await planningPage.getTableTotal();
    expect(total).toBeTruthy();
  });
});
