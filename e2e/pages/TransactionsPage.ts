import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransactionsPage extends BasePage {
  readonly pageTitle = 'h1:has-text("Transactions")';
  readonly searchInput = 'input[placeholder="Search transactions..."]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigateTo('/transactions');
  }

  async addIncome(description: string, amount: string, date: string) {
    const incomeSection = this.page.locator('form').first();
    await incomeSection.locator('input[placeholder="Salary, freelance..."]').fill(description);
    await incomeSection.locator('input[type="number"]').fill(amount);
    await incomeSection.locator('input[type="date"]').fill(date);
    await incomeSection.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(500);
  }

  async fillTransactionForm(description: string, amount: string, date: string) {
    const form = this.page.locator('form').nth(1);
    const descInput = form.locator('input[placeholder="What was this for?"]');
    const amountInput = form.locator('input[type="number"]');
    const dateInput = form.locator('input[type="date"]');
    await descInput.fill(description);
    await amountInput.fill(amount);
    await dateInput.fill(date);
  }

  async selectCategory(categoryName: string) {
    const categorySelect = this.page.locator('select').first();
    await categorySelect.selectOption({ label: categoryName });
  }

  async submitTransaction() {
    const form = this.page.locator('form').nth(1);
    await form.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(500);
  }

  async addTransaction(category: string, description: string, amount: string, date: string) {
    await this.selectCategory(category);
    await this.fillTransactionForm(description, amount, date);
    await this.submitTransaction();
  }

  getTransactionRow(selector: string) {
    return this.page.locator(selector);
  }

  async getTransactionCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return rows.count();
  }

  async deleteTransaction(description: string) {
    const row = this.page.locator(`table tbody tr:has-text("${description}")`);
    await row.hover();
    await row.locator('button').last().click();
    await this.page.waitForTimeout(500);
  }

  async filterByMonth(monthLabel: string) {
    const monthSelect = this.page.locator('select').nth(1);
    await monthSelect.selectOption({ label: monthLabel });
  }

  async filterByCategory(categoryName: string) {
    const catSelect = this.page.locator('select').nth(2);
    await catSelect.selectOption({ label: categoryName });
  }

  async searchTransactions(query: string) {
    await this.page.fill(this.searchInput, query);
  }

  getAmountCell(description: string): Locator {
    return this.page.locator(`table tbody tr:has-text("${description}") td:nth-child(4)`);
  }
}
