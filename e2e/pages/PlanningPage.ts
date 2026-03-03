import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PlanningPage extends BasePage {
  readonly heading = this.page.locator('h1');
  readonly incomeInput = this.page.locator('input[type="number"][step="0.01"][min="0"]').first();

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigateTo('/plan');
  }

  async waitForPlannerLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async simulateIncome(amount: string) {
    await this.incomeInput.fill(amount, { force: true });
    await this.page.waitForTimeout(300);
  }

  async clearIncomeOverride() {
    await this.page.locator('button:has-text("clear")').click();
    await this.page.waitForTimeout(300);
  }

  getPlannedInput(index: number) {
    return this.page.locator('input[type="number"]').nth(index);
  }

  getCategoryRow(name: string) {
    return this.page.locator(`tr:has-text("${name}")`).first();
  }

  async setPlannedAmount(categoryName: string, amount: string) {
    const row = this.getCategoryRow(categoryName);
    await row.locator('input[type="number"]').fill(amount, { force: true });
    await this.page.waitForTimeout(300);
  }

  async getSurplusOrShortfall(): Promise<string> {
    const card = this.page.locator('div:has-text("Surplus"), div:has-text("Shortfall")').first();
    const value = await card.locator('span.text-xl.font-bold').textContent();
    return value?.trim() ?? '';
  }

  async getMonthlyIncome(): Promise<string> {
    const card = this.page.locator('div:has-text("Monthly Income")').first();
    const value = await card.locator('span.text-xl.font-bold').textContent();
    return value?.trim() ?? '';
  }

  async getTotalMonthlyNeed(): Promise<string> {
    const card = this.page.locator('div:has-text("Total Monthly Need")').first();
    const value = await card.locator('span.text-xl.font-bold').textContent();
    return value?.trim() ?? '';
  }

  async getTableTotal(): Promise<string> {
    const footer = this.page.locator('tfoot td').nth(3);
    const value = await footer.textContent();
    return value?.trim() ?? '';
  }

  async getCategoryDelta(categoryName: string): Promise<string> {
    const row = this.getCategoryRow(categoryName);
    const delta = await row.locator('td').last().textContent();
    return delta?.trim() ?? '';
  }
}
