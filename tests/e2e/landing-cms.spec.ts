import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";

const webBaseUrl = process.env.E2E_WEB_URL ?? "http://127.0.0.1:3000";
const apiBaseUrl = process.env.E2E_API_URL ?? `${webBaseUrl}/api/v1`;
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@festivaldesapeguese.com.br";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin@2611";
const adminSessionStorageKey = "festival-desapegue-se-admin-session";

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  };
};

type LandingAsset = {
  id: string;
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  src: string;
  mimeType: string;
  altText: string;
  sortOrder: number;
};

type LandingItem = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  value: string | null;
  icon: string | null;
  color: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
};

type LandingSection = {
  id: string;
  key: string;
  title: string | null;
  description: string | null;
  items: LandingItem[];
  assets: LandingAsset[];
};

type LandingPageContent = {
  seoTitle: string;
  sections: LandingSection[];
  assets: LandingAsset[];
};

async function apiLogin(request: APIRequestContext, email: string, password: string): Promise<AuthSession> {
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });

  expect(response.status()).toBe(200);
  return response.json();
}

async function getLanding(request: APIRequestContext): Promise<LandingPageContent> {
  const response = await request.get(`${apiBaseUrl}/landing-pages/default`);
  expect(response.status()).toBe(200);
  return response.json();
}

async function getHero(request: APIRequestContext): Promise<LandingSection> {
  return getSection(request, "hero");
}

async function getSection(request: APIRequestContext, key: string): Promise<LandingSection> {
  const landing = await getLanding(request);
  const section = landing.sections.find((currentSection) => currentSection.key === key);
  expect(section).toBeTruthy();
  return section as LandingSection;
}

async function updateSection(
  request: APIRequestContext,
  id: string,
  payload: Record<string, unknown>,
  accessToken: string
) {
  const response = await request.patch(`${apiBaseUrl}/admin/landing-sections/${id}`, {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(200);
}

async function updateItem(
  request: APIRequestContext,
  id: string,
  payload: Record<string, unknown>,
  accessToken: string
) {
  const response = await request.patch(`${apiBaseUrl}/admin/landing-items/${id}`, {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(200);
}

async function updateAsset(
  request: APIRequestContext,
  id: string,
  payload: Record<string, unknown>,
  accessToken: string
) {
  const response = await request.patch(`${apiBaseUrl}/admin/landing-assets/${id}`, {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(200);
}

async function loginAsAdminInUi(page: Page) {
  await page.goto("/pt/admin/login");
  await page.getByLabel("E-mail").fill(adminEmail);
  await page.getByLabel("Senha").fill(adminPassword);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/auth/login") && response.status() === 200),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);
  await expect(page.getByText("Modo administrador")).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(2);
}

function heroHeading(page: Page) {
  return page.locator("#main-content").getByRole("heading", { name: /^Festival Desapegue-se/i });
}

function restoreAssetPayload(asset: LandingAsset) {
  return {
    key: asset.key,
    type: asset.type,
    theme: asset.theme,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    base64Data: asset.src,
    altText: asset.altText,
    sortOrder: asset.sortOrder,
  };
}

async function createLargeNoisyPng(page: Page) {
  const base64 = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1800;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas indisponível.");
    }

    const imageData = context.createImageData(canvas.width, canvas.height);
    for (let offset = 0; offset < imageData.data.length; offset += 4) {
      imageData.data[offset] = Math.floor(Math.random() * 256);
      imageData.data[offset + 1] = Math.floor(Math.random() * 256);
      imageData.data[offset + 2] = Math.floor(Math.random() * 256);
      imageData.data[offset + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  });

  expect(base64.length).toBeGreaterThan(8_000_000);

  return Buffer.from(base64, "base64");
}

async function createTinyPng(page: Page, color: string) {
  const base64 = await page.evaluate((fillColor) => {
    const canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas indisponível.");
    }

    context.fillStyle = fillColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1];
  }, color);

  return Buffer.from(base64, "base64");
}

test.describe("Landing CMS hardening", () => {
  test("não emite erro de hidratação por HTML inválido no rodapé em modo admin", async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() !== "error") return;

      const text = message.text();

      if (text.includes("cannot be a descendant") || text.includes("hydration")) {
        hydrationErrors.push(text);
      }
    });

    await loginAsAdminInUi(page);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    expect(hydrationErrors).toEqual([]);
  });

  test("renderiza a landing pública, mantém controles admin ocultos e assina newsletter", async ({
    page,
  }, testInfo) => {
    await page.goto("/pt");

    await expect(heroHeading(page)).toBeVisible();
    await expect(page.getByText("Modo administrador")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Editar texto" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    const invalidNewsletter = page.getByLabel("Endereço de email");
    await invalidNewsletter.fill("email-invalido");
    const formIsValid = await invalidNewsletter.evaluate((input) => (input as HTMLInputElement).form?.checkValidity());
    expect(formIsValid).toBe(false);

    const uniqueEmail = `newsletter.${Date.now()}.${testInfo.project.name.replace(/\W+/g, "-")}@example.com`;
    await invalidNewsletter.fill(uniqueEmail);
    const [newsletterResponse] = await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes("/newsletter/subscriptions") && response.status() === 201
      ),
      page.getByRole("button", { name: "Assinar Newsletter" }).click(),
    ]);
    const newsletterPayload = await newsletterResponse.json();

    await expect(page.getByLabel("Endereço de email")).toHaveValue("");
    expect(newsletterPayload.message).toEqual(expect.any(String));
  });

  test("nega login inválido, usuário membro e chamadas admin sem autorização", async ({ page, request }, testInfo) => {
    await page.goto("/pt/admin/login");
    await page.getByLabel("E-mail").fill(`inexistente.${Date.now()}@example.com`);
    await page.getByLabel("Senha").fill("senha-errada");
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/auth/login") && response.status() === 401),
      page.getByRole("button", { name: "Entrar" }).click(),
    ]);
    await expect(page.getByText("Não foi possível entrar. Confira e-mail e senha.")).toBeVisible();

    const memberEmail = `member.${Date.now()}.${testInfo.project.name.replace(/\W+/g, "-")}@example.com`;
    const registerResponse = await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        name: "Usuário Membro E2E",
        email: memberEmail,
        password: "Member@2611!",
      },
    });
    expect(registerResponse.status()).toBe(201);
    const memberSession = (await registerResponse.json()) as AuthSession;
    expect(memberSession.user.role).toBe("MEMBER");

    await page.getByLabel("E-mail").fill(memberEmail);
    await page.getByLabel("Senha").fill("Member@2611!");
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/auth/login") && response.status() === 200),
      page.getByRole("button", { name: "Entrar" }).click(),
    ]);
    await expect(page.getByText("Este usuário não tem permissão de administrador.")).toBeVisible();
    await expect(page).toHaveURL(/\/pt\/admin\/login$/);

    const hero = await getHero(request);
    const anonymousPatch = await request.patch(`${apiBaseUrl}/admin/landing-sections/${hero.id}`, {
      data: { title: "Ataque anônimo" },
    });
    expect(anonymousPatch.status()).toBe(401);

    const memberPatch = await request.patch(`${apiBaseUrl}/admin/landing-sections/${hero.id}`, {
      data: { title: "Ataque membro" },
      headers: { Authorization: `Bearer ${memberSession.accessToken}` },
    });
    expect(memberPatch.status()).toBe(403);
  });

  test("edita o título principal inline e persiste no banco", async ({ page, request }, testInfo) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const originalTitle = hero.title ?? "Festival Desapegue-se";
    const editedTitle = `${originalTitle} E2E ${testInfo.project.name}`;

    try {
      await loginAsAdminInUi(page);

      const titleEditor = page.getByTestId("hero-title");
      await titleEditor.hover();
      await titleEditor.getByRole("button", { name: "Editar texto" }).click();
      await titleEditor.locator("input").fill(editedTitle);
      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) => response.url().includes(`/admin/landing-sections/${hero.id}`) && response.status() === 200
        ),
        titleEditor.getByRole("button", { name: "Salvar" }).click(),
      ]);

      expect(updateResponse.status()).toBe(200);
      await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible({ timeout: 1000 });

      const updatedHero = await getHero(request);
      expect(updatedHero.title).toBe(editedTitle);
    } finally {
      await updateSection(request, hero.id, { title: originalTitle }, session.accessToken);
    }
  });

  test("renova a sessão admin expirada e repete a atualização inline", async ({ page, request }, testInfo) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const originalTitle = hero.title ?? "Festival Desapegue-se";
    const editedTitle = `${originalTitle} Refresh ${testInfo.project.name}`;

    await page.addInitScript(
      ({ key, staleSession }) => {
        window.localStorage.setItem(key, JSON.stringify(staleSession));
      },
      {
        key: adminSessionStorageKey,
        staleSession: {
          ...session,
          accessToken: "invalid-access-token",
        },
      }
    );

    try {
      await page.goto("/pt");
      await expect(page.getByText("Modo administrador")).toBeVisible();

      const titleEditor = page.getByTestId("hero-title");
      await titleEditor.hover();
      await titleEditor.getByRole("button", { name: "Editar texto" }).click();
      await titleEditor.locator("input").fill(editedTitle);

      const [refreshResponse, updateResponse] = await Promise.all([
        page.waitForResponse((response) => response.url().includes("/auth/refresh") && response.status() === 200),
        page.waitForResponse(
          (response) => response.url().includes(`/admin/landing-sections/${hero.id}`) && response.status() === 200
        ),
        titleEditor.getByRole("button", { name: "Salvar" }).click(),
      ]);

      expect(refreshResponse.status()).toBe(200);
      expect(updateResponse.status()).toBe(200);
      await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible({ timeout: 1000 });

      const updatedHero = await getHero(request);
      expect(updatedHero.title).toBe(editedTitle);
    } finally {
      await updateSection(request, hero.id, { title: originalTitle }, session.accessToken);
    }
  });

  test("renderiza conteúdo malicioso como texto e não executa script", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const originalTitle = hero.title ?? "Festival Desapegue-se";
    const maliciousTitle = '<img src=x onerror=alert("xss")>Festival Desapegue-se';
    let dialogOpened = false;

    page.on("dialog", async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    try {
      await updateSection(request, hero.id, { title: maliciousTitle }, session.accessToken);
      await page.goto("/pt");

      await expect(page.getByText(maliciousTitle)).toBeVisible();
      await page.waitForTimeout(500);
      expect(dialogOpened).toBe(false);
    } finally {
      await updateSection(request, hero.id, { title: originalTitle }, session.accessToken);
    }
  });

  test("bloqueia upload SVG no cliente antes de chamar a API", async ({ page }) => {
    await loginAsAdminInUi(page);

    let assetPatchWasSent = false;
    page.on("request", (request) => {
      if (request.url().includes("/admin/landing-assets/") && request.method() === "PATCH") {
        assetPatchWasSent = true;
      }
    });

    await page.getByTestId("hero-logo-input").setInputFiles({
      name: "unsafe.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from('<svg><script>alert("xss")</script></svg>'),
    });

    await expect(page.getByText("Não foi possível atualizar a imagem.")).toBeVisible();
    await page.waitForTimeout(700);
    expect(assetPatchWasSent).toBe(false);
  });

  test("não abre o lightbox quando o administrador clica em editar imagem do carrossel", async ({ page }) => {
    await loginAsAdminInUi(page);

    const firstHeroImage = page.getByTestId("hero-image-0");
    await firstHeroImage.evaluate((element) => element.scrollIntoView({ block: "center", inline: "center" }));
    await firstHeroImage.hover();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await firstHeroImage.getByRole("button", { name: "Editar imagem" }).click();
    await fileChooserPromise;

    await page.waitForTimeout(500);
    await expect(page.getByTestId("hero-lightbox")).toHaveCount(0);
  });

  test("mantém controles de configuração do admin com fonte mínima de 16px", async ({ page }) => {
    await loginAsAdminInUi(page);
    await page.getByTestId("regenerar-section").scrollIntoViewIfNeeded();

    const undersizedControls = await page.evaluate(() => {
      const selectors = [
        "label:has(select)",
        "label:has(input[type='color'])",
        "button[aria-label^='Editar link']",
        "button[aria-label^='Adicionar']",
      ];

      return Array.from(document.querySelectorAll<HTMLElement>(selectors.join(",")))
        .map((element) => ({
          text: (element.innerText || element.getAttribute("aria-label") || "").trim(),
          fontSize: Number.parseFloat(window.getComputedStyle(element).fontSize),
        }))
        .filter((control) => control.fontSize < 16);
    });

    expect(undersizedControls).toEqual([]);
    await expectNoHorizontalOverflow(page);
  });

  test("baixa a lista de newsletter em CSV pela barra administrativa", async ({ page, request }, testInfo) => {
    const uniqueEmail = `newsletter.csv.${Date.now()}.${testInfo.project.name.replace(/\W+/g, "-")}@example.com`;
    const subscribeResponse = await request.post(`${apiBaseUrl}/newsletter/subscriptions`, {
      data: { email: uniqueEmail, source: "admin-e2e" },
    });
    expect(subscribeResponse.status()).toBe(201);

    await loginAsAdminInUi(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar newsletter CSV" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^newsletter-festival-desapegue-se-\d{4}-\d{2}-\d{2}\.csv$/);
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const csv = readFileSync(downloadPath!, "utf8");
    expect(csv).toContain("email,source,isActive,createdAt,updatedAt");
    expect(csv).toContain(uniqueEmail);
    expect(csv).toContain("admin-e2e");
  });

  test("restaura a landing para o backup default versão 01", async ({ page, request }, testInfo) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const editedTitle = `Título alterado antes do restore ${Date.now()} ${testInfo.project.name}`;

    await updateSection(request, hero.id, { title: editedTitle }, session.accessToken);

    await loginAsAdminInUi(page);
    await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible();

    await page.getByRole("button", { name: "Restaurar backup" }).click();
    await expect(page.getByText("Restaurar backup da versão 01?")).toBeVisible();

    const [restoreResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/admin/landing-pages/default/restore") && response.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Restaurar versão 01" }).click(),
    ]);

    expect(restoreResponse.status()).toBe(200);
    await expect(
      page.getByTestId("hero-title").getByRole("heading", { name: "Festival Desapegue-se", exact: true })
    ).toBeVisible({ timeout: 1000 });
    await expect(page.getByText("Backup versão 01 restaurado.")).toBeVisible();

    const restoredHero = await getHero(request);
    expect(restoredHero.title).toBe("Festival Desapegue-se");
  });

  test("compacta imagem grande antes de atualizar um asset da landing", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const asset = hero.assets.find((currentAsset) => currentAsset.type === "image");
    expect(asset).toBeTruthy();

    try {
      await loginAsAdminInUi(page);
      const largeImage = await createLargeNoisyPng(page);
      const firstHeroImage = page.getByTestId("hero-image-0");
      await firstHeroImage.scrollIntoViewIfNeeded();

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-assets/${asset!.id}`) && response.request().method() === "PATCH"
        ),
        firstHeroImage.getByTestId("hero-image-0-input").setInputFiles({
          name: "foto-grande.png",
          mimeType: "image/png",
          buffer: largeImage,
        }),
      ]);

      expect(updateResponse.status()).toBe(200);
      const updatedAsset = (await updateResponse.json()) as LandingAsset;
      expect(updatedAsset.src.length).toBeLessThan(8_100_000);
      await expect(page.getByText("Imagem atualizada.")).toBeVisible();
    } finally {
      await updateAsset(request, asset!.id, restoreAssetPayload(asset!), session.accessToken);
    }
  });

  test("mantém carrossel sem tema e logos separadas por tema ao atualizar imagens", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const carouselAssets = hero.assets.filter((currentAsset) => currentAsset.type === "image");
    const carouselAsset = carouselAssets[0];
    expect(carouselAsset).toBeTruthy();

    try {
      await updateAsset(request, carouselAsset.id, { theme: "light" }, session.accessToken);

      await loginAsAdminInUi(page);
      const replacementImage = await createTinyPng(page, "#db2777");
      const firstHeroImage = page.getByTestId("hero-image-0");
      await firstHeroImage.scrollIntoViewIfNeeded();

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-assets/${carouselAsset.id}`) &&
            response.request().method() === "PATCH"
        ),
        firstHeroImage.getByTestId("hero-image-0-input").setInputFiles({
          name: "carrossel-compartilhado.png",
          mimeType: "image/png",
          buffer: replacementImage,
        }),
      ]);

      expect(updateResponse.status()).toBe(200);
      const updatedHero = await getHero(request);
      const updatedCarouselAsset = updatedHero.assets.find((currentAsset) => currentAsset.id === carouselAsset.id);

      expect(updatedCarouselAsset?.src).not.toBe(carouselAsset.src);
      expect(updatedCarouselAsset?.theme).toBeNull();

      const lightLogo = updatedHero.assets.find((currentAsset) => currentAsset.key === "main_logo_light");
      const darkLogo = updatedHero.assets.find((currentAsset) => currentAsset.key === "main_logo_dark");
      expect(lightLogo?.theme).toBe("light");
      expect(darkLogo?.theme).toBe("dark");
      expect(lightLogo?.id).not.toBe(darkLogo?.id);
    } finally {
      await updateAsset(request, carouselAsset.id, restoreAssetPayload(carouselAsset), session.accessToken);
    }
  });

  test("permite adicionar um novo card de regeneração quando há menos de cinco", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const section = await getSection(request, "regenerar");
    const removedCard = section.items.find((item) => item.type === "pillar_card");
    expect(removedCard).toBeTruthy();
    let createdItemId: string | null = null;

    try {
      const removeResponse = await request.delete(`${apiBaseUrl}/admin/landing-items/${removedCard!.id}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      expect(removeResponse.status()).toBe(204);

      await loginAsAdminInUi(page);
      await page.getByTestId("regenerar-section").scrollIntoViewIfNeeded();

      const addButton = page.getByRole("button", { name: "Adicionar card de regeneração" });
      await expect(addButton).toBeVisible();
      const [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-sections/${section.id}/items`) && response.status() === 201
        ),
        addButton.click(),
      ]);
      const createdItem = (await createResponse.json()) as LandingItem;
      createdItemId = createdItem.id;

      await expect(page.getByRole("heading", { name: "Novo card" })).toBeVisible();
    } finally {
      await updateItem(request, removedCard!.id, { isActive: true }, session.accessToken);
      if (createdItemId) {
        await request.delete(`${apiBaseUrl}/admin/landing-items/${createdItemId}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
      }
    }
  });

  test("permite editar links do footer no modo administrador", async ({ page }) => {
    await loginAsAdminInUi(page);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    await expect(page.getByLabel("Editar link Política de Cookies e Privacidade")).toBeVisible();
    await expect(page.getByLabel("Editar link Instagram")).toBeVisible();
    await expect(page.getByLabel("Editar link Entrar na comunidade")).toBeVisible();
  });

  test("mantém quantitativos limitados a cinco e expõe fundo editável", async ({ page }) => {
    await loginAsAdminInUi(page);
    await page.getByTestId("regenerar-section").scrollIntoViewIfNeeded();

    await expect(page.getByLabel("Fundo dos quantitativos")).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar quantitativo" })).toBeDisabled();
    await expect(page.getByText("Limite de 5 quantitativos")).toBeVisible();
  });

  test("permite editar o valor numérico de um quantitativo", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const section = await getSection(request, "regenerar");
    const stat = section.items.find((item) => item.type === "stat" && item.value);
    expect(stat).toBeTruthy();

    const originalValue = stat!.value;
    const editedValue = `+${Date.now().toString().slice(-4)}`;

    try {
      await loginAsAdminInUi(page);
      await page.getByTestId("regenerar-section").scrollIntoViewIfNeeded();

      const valueEditor = page.getByTestId(`stat-value-${stat!.key}`);
      await valueEditor.hover();
      await valueEditor.getByRole("button", { name: "Editar texto" }).click();
      await valueEditor.locator("input").fill(editedValue);

      const [updateResponse] = await Promise.all([
        page.waitForResponse(
          (response) => response.url().includes(`/admin/landing-items/${stat!.id}`) && response.status() === 200
        ),
        valueEditor.getByRole("button", { name: "Salvar" }).click(),
      ]);

      expect(updateResponse.status()).toBe(200);
      await expect(page.getByText(editedValue).first()).toBeVisible({ timeout: 1000 });

      const updatedSection = await getSection(request, "regenerar");
      const updatedStat = updatedSection.items.find((item) => item.id === stat!.id);
      expect(updatedStat?.value).toBe(editedValue);
    } finally {
      await updateItem(request, stat!.id, { value: originalValue }, session.accessToken);
    }
  });

  test("permite editar ícone, cor e link de um espaço temático", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const section = await getSection(request, "programacao");
    const thematicSpace = section.items.find((item) => item.type === "thematic_space" && item.title);
    expect(thematicSpace).toBeTruthy();
    const original = {
      icon: thematicSpace!.icon,
      color: thematicSpace!.color,
      url: thematicSpace!.url,
    };

    try {
      await loginAsAdminInUi(page);
      await page.getByText("Espaços Temáticos").scrollIntoViewIfNeeded();

      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-items/${thematicSpace!.id}`) && response.status() === 200
        ),
        page.getByLabel(`Ícone ${thematicSpace!.title}`).selectOption("Recycle"),
      ]);

      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-items/${thematicSpace!.id}`) && response.status() === 200
        ),
        page.getByLabel(`Cor ${thematicSpace!.title}`).selectOption("bg-espacos-magenta"),
      ]);

      await page.getByLabel(`Editar link ${thematicSpace!.title}`).click();
      await page.getByLabel(`URL ${thematicSpace!.title}`).fill("https://example.com/feira-de-trocas");
      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/admin/landing-items/${thematicSpace!.id}`) && response.status() === 200
        ),
        page.getByLabel(`Salvar link ${thematicSpace!.title}`).click(),
      ]);

      await expect(page.getByRole("link", { name: "Acessar" }).first()).toHaveAttribute(
        "href",
        "https://example.com/feira-de-trocas"
      );
    } finally {
      await updateItem(request, thematicSpace!.id, original, session.accessToken);
    }
  });

  test("permite editar o link do CTA de ingresso", async ({ page, request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const section = await getSection(request, "programacao");
    const ctaLink = section.items.find((item) => item.type === "cta_link" && item.key === "sympla-ingresso");
    expect(ctaLink).toBeTruthy();
    const originalUrl = ctaLink!.url;

    try {
      await loginAsAdminInUi(page);
      await page.locator("#programacao").scrollIntoViewIfNeeded();

      await page.getByLabel(`Editar link ${ctaLink!.title}`).click();
      await page.getByLabel(`URL ${ctaLink!.title}`).fill("https://example.com/ingresso");
      await Promise.all([
        page.waitForResponse(
          (response) => response.url().includes(`/admin/landing-items/${ctaLink!.id}`) && response.status() === 200
        ),
        page.getByLabel(`Salvar link ${ctaLink!.title}`).click(),
      ]);

      await expect(page.getByRole("link", { name: ctaLink!.title ?? "Retire seu ingresso" })).toHaveAttribute(
        "href",
        "https://example.com/ingresso"
      );
    } finally {
      await updateItem(request, ctaLink!.id, { url: originalUrl }, session.accessToken);
    }
  });

  test("bloqueia assets inválidos na API mesmo com token admin", async ({ request }) => {
    const session = await apiLogin(request, adminEmail, adminPassword);
    const hero = await getHero(request);
    const asset = hero.assets[0] ?? (await getLanding(request)).assets[0];
    expect(asset).toBeTruthy();

    const htmlMimeResponse = await request.patch(`${apiBaseUrl}/admin/landing-assets/${asset.id}`, {
      data: {
        mimeType: "text/html",
        base64Data: Buffer.from("<strong>unsafe</strong>").toString("base64"),
      },
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(htmlMimeResponse.status()).toBe(400);

    const dataUrlMimeResponse = await request.patch(`${apiBaseUrl}/admin/landing-assets/${asset.id}`, {
      data: {
        mimeType: "image/png",
        base64Data: `data:text/html;base64,${Buffer.from("<script>alert(1)</script>").toString("base64")}`,
      },
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(dataUrlMimeResponse.status()).toBe(400);

    const malformedBase64Response = await request.patch(`${apiBaseUrl}/admin/landing-assets/${asset.id}`, {
      data: {
        mimeType: "image/png",
        base64Data: "@@@@",
      },
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    expect(malformedBase64Response.status()).toBe(400);
  });
});
