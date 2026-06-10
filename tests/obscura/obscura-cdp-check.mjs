import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const webBaseUrl = process.env.E2E_WEB_URL ?? "http://127.0.0.1:3000";
const apiBaseUrl = process.env.E2E_API_URL ?? `${webBaseUrl}/api/v1`;
const cdpEndpoint = process.env.OBSCURA_CDP_ENDPOINT ?? "http://127.0.0.1:9223";
const outputRoot = path.resolve(process.cwd(), "output", "obscura");
const tinyGifDataUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function injectBase(html, baseHref) {
  return html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref.replace(/\/$/, "")}/">`);
}

function shrinkBase64Images(value) {
  return value.replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, tinyGifDataUrl);
}

function sanitizeSnapshotHtml(html) {
  return shrinkBase64Images(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*>/gi, "");
}

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();

  assert(response.ok, `HTTP ${response.status} ao buscar ${url}.`);
  return {
    status: response.status,
    text,
  };
}

async function loadHtmlSnapshot(page, html) {
  await page.evaluate((content) => {
    document.open();
    document.write(content);
    document.close();
  }, html);
}

const browser = await chromium.connectOverCDP(cdpEndpoint);
const context = browser.contexts()[0] ?? (await browser.newContext());
const page = context.pages()[0] ?? (await context.newPage());
const report = {};

try {
  await mkdir(outputRoot, { recursive: true });

  const publicHtml = await fetchText(`${webBaseUrl}/pt`);
  await loadHtmlSnapshot(page, injectBase(sanitizeSnapshotHtml(publicHtml.text), webBaseUrl));
  await page.waitForFunction(() => document.body?.innerText.includes("Festival Desapegue-se"), null, {
    timeout: 10_000,
  });
  const publicState = await page.evaluate(() => ({
    title: document.title,
    hasMainContent: Boolean(document.querySelector("#main-content")),
    hasFestivalText: document.body.innerText.includes("Festival Desapegue-se"),
    hasNewsletterText: document.body.innerText.includes("Inscreva-se"),
    hasAdminModeText: document.body.innerText.includes("Modo administrador"),
    adminControls: document.querySelectorAll('button[aria-label="Editar texto"],button[aria-label="Editar imagem"]')
      .length,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    imageCount: document.images.length,
    sourceStatus: Number(document.body.dataset.sourceStatus ?? 200),
  }));

  assert(publicState.hasFestivalText, "Conteúdo público não contém Festival Desapegue-se.");
  assert(publicState.hasNewsletterText, "Conteúdo público não contém newsletter.");
  assert(!publicState.hasAdminModeText, "Modo administrador apareceu para usuário público.");
  assert(publicState.adminControls === 0, "Controles admin apareceram para usuário público.");
  assert(publicState.horizontalOverflow <= 2, "Landing pública tem overflow horizontal.");
  report.publicState = publicState;

  const loginHtml = await fetchText(`${webBaseUrl}/pt/admin/login`);
  await loadHtmlSnapshot(page, injectBase(sanitizeSnapshotHtml(loginHtml.text), webBaseUrl));
  await page.waitForFunction(() => document.body?.innerText.includes("Admin Festival"), null, { timeout: 10_000 });
  const loginState = await page.evaluate(() => ({
    hasAdminTitle: document.body.innerText.includes("Admin Festival"),
    hasEmailLabel: document.body.innerText.includes("E-mail"),
    hasPasswordLabel: document.body.innerText.includes("Senha"),
    formCount: document.forms.length,
  }));

  assert(loginState.hasAdminTitle, "Tela de login admin não renderizou o título.");
  assert(loginState.hasEmailLabel, "Tela de login admin não renderizou e-mail.");
  assert(loginState.hasPasswordLabel, "Tela de login admin não renderizou senha.");
  report.loginState = loginState;

  const apiJson = await fetchText(`${apiBaseUrl}/landing-pages/default`);
  await loadHtmlSnapshot(page, `<pre>${escapeHtml(shrinkBase64Images(apiJson.text))}</pre>`);
  const apiText = await page.evaluate(() => document.body?.innerText ?? document.documentElement.innerText ?? "");
  assert(apiText.includes("Festival Desapegue-se"), "JSON público da API não contém Festival Desapegue-se.");
  assert(apiText.includes("sections"), "JSON público da API não contém sections.");
  assert(apiText.includes("assets"), "JSON público da API não contém assets.");
  report.apiState = {
    hasFestivalText: apiText.includes("Festival Desapegue-se"),
    hasSections: apiText.includes("sections"),
    hasAssets: apiText.includes("assets"),
    bodyLength: apiText.length,
  };

  await writeFile(path.join(outputRoot, "obscura-cdp-report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(`Obscura CDP checks concluídos. Evidências em ${outputRoot}`);
} finally {
  await browser.close();
}
