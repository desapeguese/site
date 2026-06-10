import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@festivaldesapeguese.com.br";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin@2611";

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

async function loginAsAdmin(page: Page) {
  await page.goto("/pt/admin/login");
  await page.getByLabel("E-mail").fill(adminEmail);
  await page.getByLabel("Senha").fill(adminPassword);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/auth/login") && response.status() === 200),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);
  await expect(page.getByText("Modo administrador")).toBeVisible();
}

test.describe("Acessibilidade", () => {
  test("home pública não possui violações WCAG críticas detectáveis", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("login administrativo mantém labels, foco e sem violações WCAG detectáveis", async ({ page }) => {
    await page.goto("/pt/admin/login");
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("modo administrador mantém controles inline acessíveis", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    await expect(page.getByLabel("Editar link Política de Cookies e Privacidade")).toBeVisible();
    await expect(page.getByLabel("Editar link Instagram")).toBeVisible();
    await expect(page.getByLabel("Editar link Entrar na comunidade")).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar card de regeneração" })).toBeVisible();

    await expectNoA11yViolations(page);
  });
});
