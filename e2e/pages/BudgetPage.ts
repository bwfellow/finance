import { type Page } from '@playwright/test';
import { SignInPage } from './SignInPage';

export class BudgetPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginAndNavigateToBudget(email: string, password: string) {
    const signIn = new SignInPage(this.page);
    await signIn.goto();
    await signIn.fillEmail(email);
    await signIn.fillPassword(password);
    await signIn.clickSignIn();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async createCategory(name: string) {
    await this.page.locator('input[placeholder="New category name..."]').fill(name);
    await this.page.locator('button:has-text("Add")').first().click();
    await this.page.waitForTimeout(500);
  }

  async assignBudget(categoryName: string, amount: string) {
    const row = this.page.locator(`tr:has-text("${categoryName}")`);
    await row.locator('td:nth-child(3) button').click();
    await row.locator('td:nth-child(3) input[type="number"]').fill(amount);
    await row.locator('td:nth-child(3) input[type="number"]').press('Enter');
    await this.page.waitForTimeout(500);
  }

  async setTarget(categoryName: string, type: string, amount: string) {
    const row = this.page.locator(`tr:has-text("${categoryName}")`);
    await row.click();
    await this.page.waitForTimeout(300);

    const detailPanel = this.page.locator('div.w-80');
    await detailPanel.locator('button:has-text("Create Target")').click();

    await detailPanel.locator('select').first().selectOption({ label: type });
    await detailPanel.locator('input[type="number"]').fill(amount);
    await detailPanel.locator('button:has-text("Save")').click();
    await this.page.waitForTimeout(500);
  }

  async goToNextMonth() {
    const buttons = this.page.locator('button');
    await buttons.first().click();
    await this.page.waitForTimeout(300);
  }

  async goToPrevMonth() {
    const navButtons = this.page.locator('div.flex.items-center.gap-1 button');
    await navButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async getReadyToAssign(): Promise<number> {
    const pill = await this.page.$('span.tabular-nums');
    if (!pill) return 0;
    const text = await pill.textContent();
    if (!text) return 0;
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  async isCategoryFunded(name: string): Promise<boolean> {
    const row = this.page.locator(`tr:has-text("${name}")`);
    const available = await row.locator('td:nth-child(5) span').textContent();
    if (!available) return false;
    const amount = parseFloat(available.replace(/[$,]/g, ''));
    return amount >= 0;
  }

  async verifyBudgetTotals(expected: { assigned: string; activity: string; available: string }) {
    const assignedCell = await this.page.locator('table tbody tr:nth-child(1) td:nth-child(3)').textContent();
    const activityCell = await this.page.locator('table tbody tr:nth-child(1) td:nth-child(4)').textContent();
    const availableCell = await this.page.locator('table tbody tr:nth-child(1) td:nth-child(5)').textContent();

    if (assignedCell?.trim() !== expected.assigned) {
      throw new Error(`Assigned mismatch: expected ${expected.assigned}, got ${assignedCell}`);
    }
    if (activityCell?.trim() !== expected.activity) {
      throw new Error(`Activity mismatch: expected ${expected.activity}, got ${activityCell}`);
    }
    if (availableCell?.trim() !== expected.available) {
      throw new Error(`Available mismatch: expected ${expected.available}, got ${availableCell}`);
    }
  }

  async archiveCategory(name: string) {
    const row = this.page.locator(`tr:has-text("${name}")`);
    await row.hover();
    await this.page.waitForTimeout(200);
    await row.locator('button:has(svg.h-3\\.5)').click();
    await this.page.waitForTimeout(500);
  }

  async getMonthDisplay(): Promise<string> {
    const heading = await this.page.$('h1');
    if (!heading) return '';
    return (await heading.textContent()) ?? '';
  }

  async getCategoryNames(): Promise<string[]> {
    const cells = await this.page.$$('table tbody tr td:first-child span.font-medium');
    const names: string[] = [];
    for (const cell of cells) {
      const text = await cell.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }
}
