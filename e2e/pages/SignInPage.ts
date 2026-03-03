import { type Page } from '@playwright/test';

export class SignInPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async fillEmail(value: string) {
    const emailInput = await this.page.$('#email');
    if (emailInput) {
      await emailInput.fill(value);
    }
  }

  async fillPassword(value: string) {
    const passwordInput = await this.page.$('div.space-y-2 > input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(value);
    }
  }

  async clickSignIn() {
    const submitBtn = await this.page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
  }

  async switchToSignUp() {
    await this.page.click('//button[contains(text(), "Sign up")]');
  }

  async switchToSignIn() {
    await this.page.click('//button[contains(text(), "Sign in instead")]');
  }

  async clickAnonymousSignIn() {
    const anonBtn = await this.page.$('button:has-text("Continue anonymously")');
    if (anonBtn) {
      await anonBtn.click();
    }
  }

  async getFormFieldCount(): Promise<number> {
    const inputs = await this.page.$$('form input');
    return inputs.length;
  }

  async getErrorMessage(): Promise<string | null> {
    const errorEl = await this.page.$('div.flex.flex-col.gap-4 > div.text-red-500');
    if (errorEl) {
      return errorEl.textContent();
    }
    return null;
  }
}
