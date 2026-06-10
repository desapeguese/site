import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const screenshotDir = path.resolve(__dirname, "..", "..", "output", "agent-browser");
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@festivaldesapeguese.com.br";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin@2611";

async function assertUsableViewport(page: Page) {
  await expect(page.locator("#main-content").getByRole("heading", { name: /^Festival Desapegue-se/i })).toBeVisible();

  const metrics = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    visibleImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth > 0).length,
    totalImages: document.images.length,
    editableButtons: document.querySelectorAll('button[aria-label="Editar texto"], button[aria-label="Editar imagem"]')
      .length,
  }));

  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(2);
  expect(metrics.totalImages).toBeGreaterThan(0);
  expect(metrics.visibleImages).toBeGreaterThan(0);
  expect(metrics.editableButtons).toBe(0);
}

test.describe("Agent-browser visual QA fallback", () => {
  test.beforeAll(() => {
    mkdirSync(screenshotDir, { recursive: true });
  });

  test("captura e valida a home pública em desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/pt");
    await assertUsableViewport(page);
    await page.screenshot({ path: path.join(screenshotDir, "desktop-home.png"), fullPage: true });
  });

  test("captura e valida a home pública em mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pt");
    await assertUsableViewport(page);
    await page.screenshot({ path: path.join(screenshotDir, "mobile-home.png"), fullPage: true });
  });

  test("captura e valida estado autenticado com edição inline", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/pt/admin/login");
    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Senha").fill(adminPassword);
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/auth/login") && response.status() === 200),
      page.getByRole("button", { name: "Entrar" }).click(),
    ]);

    await expect(page.getByText("Modo administrador")).toBeVisible();
    await page.getByTestId("hero-title").hover();
    await expect(page.getByTestId("hero-title").getByRole("button", { name: "Editar texto" })).toBeVisible();
    await expect(page.getByTestId("hero-logo").getByRole("button", { name: "Editar imagem" })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, "admin-editor.png"), fullPage: true });
  });
});
