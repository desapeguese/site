# Next Embedded Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o backend do Festival Desapegue-se para dentro do Next.js, eliminando a necessidade de hospedar a API Nest separadamente, mas mantendo o PostgreSQL atual, o schema Prisma e as regras de negócio já implementadas.

**Architecture:** O projeto `festival-desapegue-se-landingage` passa a ter uma camada backend própria usando Next.js App Router Route Handlers em `src/app/api/v1/.../route.ts`. A lógica de domínio hoje no Nest será portada para serviços server-only em `src/server`, com Prisma conectado ao mesmo banco PostgreSQL e com contratos HTTP compatíveis com os endpoints atuais para evitar retrabalho no editor inline e nos testes E2E.

**Tech Stack:** Next.js 15 App Router, Route Handlers, TypeScript, Prisma 6, PostgreSQL, Zod, bcryptjs, JWT assinado em Node runtime, Playwright, Vitest/Jest conforme viabilidade do runner local.

---

## Contexto Do Que Já Foi Feito

### API Nest atual

O repositório `festival-desapegue-se-api` já contém:

- Prisma com PostgreSQL em `prisma/schema.prisma`.
- Tabelas de autenticação: `User`, `RefreshToken`, `RequestLog`.
- Tabelas de CMS: `LandingPage`, `LandingSection`, `LandingItem`, `LandingAsset`.
- Tabela de newsletter: `NewsletterSubscription`.
- Seed com administrador inicial `admin@festivaldesapeguese.com.br` e senha local `Admin@2611`.
- Seed da landing com os valores atuais, logos, imagens, cards, estatísticas, programação e footer em `prisma/seed.ts` e `src/modules/landing/default-landing-content.ts`.
- Regras de autenticação em `src/modules/auth/auth.service.ts`.
- Regras de landing CMS em `src/modules/landing/landing.service.ts`.
- Regras de newsletter em `src/modules/newsletter/newsletter.service.ts` e rate limit em memória em `newsletter-rate-limit.guard.ts`.
- Coleção Insomnia em `docs/insomnia/festival-desapegue-se-api.insomnia.json`.

### Frontend atual

O repositório `festival-desapegue-se-landingage` já contém:

- Landing Next.js 15 com App Router.
- Cliente HTTP em `src/lib/api/festival-api.ts` apontando para `NEXT_PUBLIC_FESTIVAL_API_URL` ou `http://localhost:3333/api/v1`.
- Tipos de landing em `src/lib/landing/types.ts`.
- Modo admin com login, sessão em `localStorage`, retry de refresh token e editor inline.
- Atualização visual imediata via `LandingContentContext`.
- Upload de imagens em Base64 com compressão no front.
- E2E de edição de texto, imagem, refresh token, modo admin, acessibilidade, visual QA e Obscura.

### Validações recentes

Antes deste plano, os builds e testes principais foram executados com sucesso:

- Frontend `pnpm build`.
- API `pnpm build`.
- API `pnpm exec jest --runInBand`.
- Frontend `pnpm exec tsc --noEmit`.
- Playwright E2E `pnpm exec playwright test tests/e2e --project=chromium`.
- Agent browser `pnpm exec playwright test tests/agent-browser --project=chromium`.
- Obscura `pnpm test:obscura`.

Observação: o runner Vitest do frontend apresentou erro de inicialização no Node `v24.13.0` com `ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-evaluator`. Isso deve ser tratado separadamente se os testes unitários do front forem usados como bloqueio.

## Decisão Técnica

Vamos implementar um backend embutido no Next.js, não um CMS de terceiros neste momento.

Motivos:

- O usuário quer remover a hospedagem separada da API.
- O domínio já está modelado no PostgreSQL.
- O editor inline já depende de contratos HTTP específicos.
- Migrar para Route Handlers mantém o front e o backend no mesmo deploy sem trocar o banco.
- Um CMS pronto, como Payload/Strapi/Sanity, adicionaria outra camada de administração e outro modelo mental, enquanto o produto atual é edição inline da própria landing.

Referências oficiais consultadas:

- Next.js Route Handlers: `https://nextjs.org/docs/app/getting-started/route-handlers`
- Next.js Backend for Frontend: `https://nextjs.org/docs/app/guides/backend-for-frontend`
- Next.js Mutating Data e Server Functions: `https://nextjs.org/docs/app/getting-started/mutating-data`
- Next.js `cookies`: `https://nextjs.org/docs/app/api-reference/functions/cookies`

## Contratos Que Devem Permanecer Compatíveis

O front deve continuar funcionando com estes endpoints no mesmo host:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/landing-pages/default`
- `PATCH /api/v1/admin/landing-pages/default`
- `PATCH /api/v1/admin/landing-sections/:id`
- `POST /api/v1/admin/landing-sections/:sectionId/items`
- `PATCH /api/v1/admin/landing-items/:id`
- `DELETE /api/v1/admin/landing-items/:id`
- `PATCH /api/v1/admin/landing-assets/:id`
- `POST /api/v1/newsletter/subscriptions`
- `GET /api/v1/admin/newsletter/subscriptions/export.csv`

Também devem ser preservados, para paridade com a API atual:

- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id/role`
- `PATCH /api/v1/users/:id/status`
- `GET /api/v1/items`
- `POST /api/v1/items`
- `GET /api/v1/items/:id`
- `PATCH /api/v1/items/:id`
- `DELETE /api/v1/items/:id`

Se a execução precisar reduzir escopo, `users` e `items` podem entrar em uma segunda etapa, mas a decisão deve ser registrada antes de remover a API Nest de produção.

## File Structure

### Arquivos a copiar/adaptar da API para o front

- Create: `festival-desapegue-se-landingage/prisma/schema.prisma` - schema PostgreSQL atual.
- Create: `festival-desapegue-se-landingage/prisma/migrations/...` - migrations existentes da API.
- Create: `festival-desapegue-se-landingage/prisma/seed.ts` - seed do banco com admin e landing default.
- Create: `festival-desapegue-se-landingage/src/server/landing/default-landing-content.ts` - defaults atuais da landing.
- Create: `festival-desapegue-se-landingage/src/server/landing/landing-assets.ts` - normalização e leitura de assets.
- Create: `festival-desapegue-se-landingage/src/server/landing/landing-service.ts` - regras de landing.
- Create: `festival-desapegue-se-landingage/src/server/landing/landing-schemas.ts` - validações Zod.
- Create: `festival-desapegue-se-landingage/src/server/auth/auth-service.ts` - login, registro, refresh, logout e `me`.
- Create: `festival-desapegue-se-landingage/src/server/auth/auth-schemas.ts` - validações Zod de auth.
- Create: `festival-desapegue-se-landingage/src/server/auth/password.ts` - hash e compare com bcryptjs.
- Create: `festival-desapegue-se-landingage/src/server/auth/token.ts` - geração, verificação e hash de tokens.
- Create: `festival-desapegue-se-landingage/src/server/newsletter/newsletter-service.ts` - persistência newsletter.
- Create: `festival-desapegue-se-landingage/src/server/newsletter/newsletter-rate-limit.ts` - rate limit por IP/e-mail.
- Create: `festival-desapegue-se-landingage/src/server/newsletter/newsletter-schemas.ts` - validação Zod.
- Create: `festival-desapegue-se-landingage/src/server/users/users-service.ts` - paridade dos endpoints de usuários.
- Create: `festival-desapegue-se-landingage/src/server/users/users-schemas.ts`.
- Create: `festival-desapegue-se-landingage/src/server/items/items-service.ts` - paridade dos endpoints genéricos de items.
- Create: `festival-desapegue-se-landingage/src/server/items/items-schemas.ts`.

### Infra server-only no front

- Create: `festival-desapegue-se-landingage/src/server/db/prisma.ts` - singleton Prisma.
- Create: `festival-desapegue-se-landingage/src/server/config/env.ts` - validação de env server-side.
- Create: `festival-desapegue-se-landingage/src/server/http/api-error.ts` - erro HTTP padronizado.
- Create: `festival-desapegue-se-landingage/src/server/http/api-response.ts` - helpers de JSON/CSV.
- Create: `festival-desapegue-se-landingage/src/server/http/route-handler.ts` - wrapper `handleApiRoute`.
- Create: `festival-desapegue-se-landingage/src/server/http/validation.ts` - parsing Zod com 400.
- Create: `festival-desapegue-se-landingage/src/server/auth/require-auth.ts` - leitura de Bearer token e checagem de role.

### Route Handlers do Next

- Create: `src/app/api/v1/health/route.ts`
- Create: `src/app/api/v1/auth/register/route.ts`
- Create: `src/app/api/v1/auth/login/route.ts`
- Create: `src/app/api/v1/auth/refresh/route.ts`
- Create: `src/app/api/v1/auth/logout/route.ts`
- Create: `src/app/api/v1/auth/me/route.ts`
- Create: `src/app/api/v1/landing-pages/default/route.ts`
- Create: `src/app/api/v1/admin/landing-pages/default/route.ts`
- Create: `src/app/api/v1/admin/landing-sections/[id]/route.ts`
- Create: `src/app/api/v1/admin/landing-sections/[sectionId]/items/route.ts`
- Create: `src/app/api/v1/admin/landing-items/[id]/route.ts`
- Create: `src/app/api/v1/admin/landing-assets/[id]/route.ts`
- Create: `src/app/api/v1/newsletter/subscriptions/route.ts`
- Create: `src/app/api/v1/admin/newsletter/subscriptions/export.csv/route.ts`
- Create: `src/app/api/v1/users/route.ts`
- Create: `src/app/api/v1/users/me/route.ts`
- Create: `src/app/api/v1/users/[id]/route.ts`
- Create: `src/app/api/v1/users/[id]/role/route.ts`
- Create: `src/app/api/v1/users/[id]/status/route.ts`
- Create: `src/app/api/v1/items/route.ts`
- Create: `src/app/api/v1/items/[id]/route.ts`

### Frontend a ajustar

- Modify: `festival-desapegue-se-landingage/package.json`
- Modify: `festival-desapegue-se-landingage/.env.example`
- Modify: `festival-desapegue-se-landingage/src/lib/api/festival-api.ts`
- Modify: `festival-desapegue-se-landingage/playwright.config.ts`
- Modify: `festival-desapegue-se-landingage/tests/e2e/landing-cms.spec.ts`
- Modify: `festival-desapegue-se-landingage/tests/agent-browser/visual-qa.spec.ts`
- Modify: `festival-desapegue-se-landingage/tests/obscura/obscura-check.ps1`
- Modify: `festival-desapegue-se-landingage/README.md`
- Modify: `festival-desapegue-se-landingage/docs/insomnia/...` se a coleção for mantida no front.

## Regras De Negócio Que Devem Ser Preservadas

### Auth

- E-mail sempre com `trim().toLowerCase()`.
- Primeiro usuário registrado vira `ADMIN`; próximos viram `MEMBER`.
- Usuário inativo não autentica.
- Senha com bcryptjs.
- Access token com payload `sub`, `email`, `name`, `role`, `type: "access"`.
- Refresh token com payload `sub`, `email`, `name`, `role`, `type: "refresh"`, `jti`.
- Refresh token salvo em banco com hash e `expiresAt`.
- Refresh token usado deve ser revogado antes de emitir nova sessão.
- `logout` revoga o refresh token quando válido, mas sempre retorna sucesso.
- Rotas admin exigem role `ADMIN`.

### Landing CMS

- `GET /landing-pages/default` busca `slug: "default"`.
- Página, seções, itens e assets inativos não aparecem no payload público.
- Ordenação por `sortOrder` ascendente em seções, itens e assets.
- `LandingAsset.src` continua sendo `data:${mimeType};base64,${base64Data}`.
- Textos editáveis passam por `trim`.
- Campos nullable aceitam `null` para limpar valor.
- `metadata` continua JSON.
- `DELETE /admin/landing-items/:id` é soft delete com `isActive: false`.
- Upload de imagem aceita apenas `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Base64 pode vir como data URL ou apenas base64 cru.
- Asset não pode apontar para `sectionId` ou `itemId` fora da mesma landing page.
- Imagens do carrossel continuam únicas para claro/escuro; logos continuam separadas por `theme: "light"` e `theme: "dark"`.

### Newsletter

- E-mail sempre com `trim().toLowerCase()`.
- `source` usa `trim().toLowerCase()` ou `footer`.
- Inscrição é idempotente por e-mail via `upsert`.
- Inscrição existente volta para `isActive: true`.
- Rate limit por IP e por e-mail deve ser preservado.
- Export CSV é rota admin e não envia e-mail.

## Task 1: Baseline E Branch De Migração

**Files:**
- Modify: none.

- [ ] **Step 1: Confirmar estado limpo do front**

Run from frontend root:

```powershell
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
git status --short
```

Expected: sem arquivos modificados antes da migração, exceto este plano se ainda não tiver sido commitado.

- [ ] **Step 2: Confirmar estado limpo da API**

Run from API root:

```powershell
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
git status --short
```

Expected: sem arquivos modificados.

- [ ] **Step 3: Criar branch no front**

Run from frontend root:

```powershell
git switch main
git pull --ff-only
git switch -c feat/next-embedded-backend
```

Expected: branch criada a partir de `main`.

- [ ] **Step 4: Salvar baseline de verificação**

Run from frontend root:

```powershell
pnpm build
pnpm exec tsc --noEmit
```

Expected: build e TypeScript passam como referência inicial.

- [ ] **Step 5: Commit do plano**

Run from frontend root:

```powershell
git add docs/superpowers/plans/2026-05-06-next-embedded-backend.md
git commit -m "docs: plan next embedded backend migration"
```

Expected: o plano fica rastreado antes das alterações.

## Task 2: Dependências Backend No Next

**Files:**
- Modify: `festival-desapegue-se-landingage/package.json`
- Modify: `festival-desapegue-se-landingage/pnpm-lock.yaml`

- [ ] **Step 1: Instalar dependências server-side**

Run from frontend root:

```powershell
pnpm add @prisma/client@^6.16.2 bcryptjs@^3.0.2 jose@^6.0.13 zod@^4.1.9
pnpm add -D prisma@^6.16.2 ts-node@^10.9.2
```

Expected: dependências adicionadas ao `package.json`.

- [ ] **Step 2: Adicionar scripts Prisma**

Modify `package.json` scripts:

```json
{
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:migrate:create": "prisma migrate dev --create-only",
  "prisma:push": "prisma db push",
  "prisma:deploy": "prisma migrate deploy",
  "prisma:studio": "prisma studio",
  "db:seed": "prisma db seed",
  "db:setup": "pnpm prisma:generate && pnpm prisma:deploy && pnpm db:seed"
}
```

Add Prisma seed config at package root:

```json
{
  "prisma": {
    "seed": "ts-node --project tsconfig.json prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Gerar lockfile atualizado**

Run from frontend root:

```powershell
pnpm install
```

Expected: `pnpm-lock.yaml` atualizado.

- [ ] **Step 4: Commit de dependências**

Run from frontend root:

```powershell
git add package.json pnpm-lock.yaml
git commit -m "build: add embedded backend dependencies"
```

Expected: commit criado.

## Task 3: Migrar Prisma E Seed Para O Front

**Files:**
- Create: `festival-desapegue-se-landingage/prisma/schema.prisma`
- Create: `festival-desapegue-se-landingage/prisma/migrations/20260315000000_init/migration.sql`
- Create: `festival-desapegue-se-landingage/prisma/migrations/20260505192144_add_landing_cms/migration.sql`
- Create: `festival-desapegue-se-landingage/prisma/migrations/migration_lock.toml`
- Create: `festival-desapegue-se-landingage/prisma/seed.ts`
- Create: `festival-desapegue-se-landingage/src/server/landing/default-landing-content.ts`
- Create: `festival-desapegue-se-landingage/src/server/landing/landing-assets.ts`

- [ ] **Step 1: Copiar schema e migrations**

Copy from API root to frontend root:

```powershell
Copy-Item ..\festival-desapegue-se-api\prisma\schema.prisma .\prisma\schema.prisma
Copy-Item ..\festival-desapegue-se-api\prisma\migrations .\prisma\migrations -Recurse
```

Expected: o front passa a ser o dono dos arquivos Prisma.

- [ ] **Step 2: Criar diretório server de landing**

Run from frontend root:

```powershell
New-Item -ItemType Directory -Force src\server\landing
```

Expected: diretório criado.

- [ ] **Step 3: Copiar defaults da landing**

Copy from API root:

```powershell
Copy-Item ..\festival-desapegue-se-api\src\modules\landing\default-landing-content.ts .\src\server\landing\default-landing-content.ts
```

Expected: o conteúdo seedado fica junto do projeto que será deployado.

- [ ] **Step 4: Adaptar helper de assets para o novo root**

Create `src/server/landing/landing-assets.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { ApiError } from "@/server/http/api-error";

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function normalizeBase64Image(value: string, fallbackMimeType = "application/octet-stream") {
  const trimmed = value.trim();
  const match = DATA_URL_PATTERN.exec(trimmed);

  if (match) {
    return {
      mimeType: assertAllowedImageMimeType(match[1]),
      base64Data: assertValidBase64(match[2]),
    };
  }

  return {
    mimeType: assertAllowedImageMimeType(fallbackMimeType),
    base64Data: assertValidBase64(trimmed),
  };
}

export function readFrontendAssetAsBase64(relativePath: string): string {
  return readFileSync(resolveFrontendPublicAssetPath(relativePath)).toString("base64");
}

function assertAllowedImageMimeType(mimeType: string): string {
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedMimeType)) {
    throw new ApiError(400, "Asset MIME type must be an image.");
  }

  return normalizedMimeType;
}

function assertValidBase64(base64Data: string): string {
  const normalizedBase64 = base64Data.trim();

  if (normalizedBase64.length === 0 || normalizedBase64.length % 4 === 1 || !BASE64_PATTERN.test(normalizedBase64)) {
    throw new ApiError(400, "Asset data must be valid Base64.");
  }

  return normalizedBase64;
}

function resolveFrontendPublicAssetPath(relativePath: string): string {
  if (isAbsolute(relativePath)) {
    throw new Error("Frontend asset paths must be relative.");
  }

  const root = process.cwd();
  const candidate = resolve(root, relativePath);
  const relativeToRoot = relative(root, candidate);

  if (relativeToRoot === ".." || relativeToRoot.startsWith("..\\") || relativeToRoot.startsWith("../") || isAbsolute(relativeToRoot)) {
    throw new Error("Frontend asset path escapes the frontend root.");
  }

  if (!existsSync(candidate)) {
    throw new Error(`Frontend asset not found: ${relativePath}`);
  }

  return candidate;
}
```

- [ ] **Step 5: Adaptar seed para imports do Next**

Create `prisma/seed.ts`:

```ts
import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";
import { DEFAULT_LANDING_CONTENT } from "../src/server/landing/default-landing-content";
import { readFrontendAssetAsBase64 } from "../src/server/landing/landing-assets";

const prisma = new PrismaClient();

function seedMetadata(metadata: Record<string, unknown> | undefined) {
  return metadata === undefined ? Prisma.JsonNull : (metadata as Prisma.InputJsonValue);
}

async function seedUsers(): Promise<void> {
  await prisma.user.upsert({
    where: { email: "admin@festivaldesapeguese.com.br" },
    update: {
      name: "Administrador Festival Desapegue-se",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@festivaldesapeguese.com.br",
      name: "Administrador Festival Desapegue-se",
      passwordHash: await hashPassword("Admin@2611"),
      role: "ADMIN",
      isActive: true,
    },
  });
}

async function seedLandingPage(): Promise<void> {
  const page = await prisma.landingPage.upsert({
    where: { slug: DEFAULT_LANDING_CONTENT.page.slug },
    update: {
      locale: DEFAULT_LANDING_CONTENT.page.locale,
      seoTitle: DEFAULT_LANDING_CONTENT.page.seoTitle,
      seoDescription: DEFAULT_LANDING_CONTENT.page.seoDescription,
      isActive: true,
    },
    create: {
      slug: DEFAULT_LANDING_CONTENT.page.slug,
      locale: DEFAULT_LANDING_CONTENT.page.locale,
      seoTitle: DEFAULT_LANDING_CONTENT.page.seoTitle,
      seoDescription: DEFAULT_LANDING_CONTENT.page.seoDescription,
      isActive: true,
    },
  });

  for (const sectionInput of DEFAULT_LANDING_CONTENT.sections) {
    const section = await prisma.landingSection.upsert({
      where: { landingPageId_key: { landingPageId: page.id, key: sectionInput.key } },
      update: {
        type: sectionInput.type,
        title: sectionInput.title ?? null,
        subtitle: sectionInput.subtitle ?? null,
        description: sectionInput.description ?? null,
        metadata: seedMetadata(sectionInput.metadata),
        sortOrder: sectionInput.sortOrder,
        isActive: true,
      },
      create: {
        landingPageId: page.id,
        key: sectionInput.key,
        type: sectionInput.type,
        title: sectionInput.title ?? null,
        subtitle: sectionInput.subtitle ?? null,
        description: sectionInput.description ?? null,
        metadata: seedMetadata(sectionInput.metadata),
        sortOrder: sectionInput.sortOrder,
        isActive: true,
      },
    });

    for (const itemInput of sectionInput.items) {
      await prisma.landingItem.upsert({
        where: { sectionId_key: { sectionId: section.id, key: itemInput.key } },
        update: {
          type: itemInput.type,
          title: itemInput.title ?? null,
          subtitle: itemInput.subtitle ?? null,
          description: itemInput.description ?? null,
          value: itemInput.value ?? null,
          icon: itemInput.icon ?? null,
          color: itemInput.color ?? null,
          url: itemInput.url ?? null,
          metadata: seedMetadata(itemInput.metadata),
          sortOrder: itemInput.sortOrder,
          isActive: true,
        },
        create: {
          sectionId: section.id,
          key: itemInput.key,
          type: itemInput.type,
          title: itemInput.title ?? null,
          subtitle: itemInput.subtitle ?? null,
          description: itemInput.description ?? null,
          value: itemInput.value ?? null,
          icon: itemInput.icon ?? null,
          color: itemInput.color ?? null,
          url: itemInput.url ?? null,
          metadata: seedMetadata(itemInput.metadata),
          sortOrder: itemInput.sortOrder,
          isActive: true,
        },
      });
    }

    for (const assetInput of sectionInput.assets) {
      await prisma.landingAsset.upsert({
        where: { landingPageId_key: { landingPageId: page.id, key: assetInput.key } },
        update: {
          sectionId: section.id,
          itemId: null,
          type: assetInput.type,
          theme: assetInput.theme ?? null,
          fileName: assetInput.fileName,
          mimeType: assetInput.mimeType,
          base64Data: readFrontendAssetAsBase64(assetInput.sourcePath),
          altText: assetInput.altText,
          sortOrder: assetInput.sortOrder,
          isActive: true,
        },
        create: {
          landingPageId: page.id,
          sectionId: section.id,
          itemId: null,
          key: assetInput.key,
          type: assetInput.type,
          theme: assetInput.theme ?? null,
          fileName: assetInput.fileName,
          mimeType: assetInput.mimeType,
          base64Data: readFrontendAssetAsBase64(assetInput.sourcePath),
          altText: assetInput.altText,
          sortOrder: assetInput.sortOrder,
          isActive: true,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  console.log("Seeding database...");
  await seedUsers();
  await seedLandingPage();
  console.log("Seed complete.");
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 6: Commit Prisma e seed**

Run from frontend root:

```powershell
git add prisma src/server/landing/default-landing-content.ts src/server/landing/landing-assets.ts
git commit -m "feat(db): move prisma schema and seed into next app"
```

Expected: commit criado.

## Task 4: Infra Server-Only, Erros E Env

**Files:**
- Create: `src/server/config/env.ts`
- Create: `src/server/db/prisma.ts`
- Create: `src/server/http/api-error.ts`
- Create: `src/server/http/api-response.ts`
- Create: `src/server/http/route-handler.ts`
- Create: `src/server/http/validation.ts`
- Modify: `.env.example`

- [ ] **Step 1: Criar env server-side**

Create `src/server/config/env.ts`:

```ts
import { z } from "zod";

const booleanFromEnv = z.preprocess(value => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off", ""].includes(normalized)) return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DATABASE_REQUIRED: booleanFromEnv.optional().default(true),
  JWT_ACCESS_SECRET: z.string().min(1).default("dev-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(1).default("dev-refresh-secret"),
  JWT_ACCESS_TTL: z.string().min(1).default("15m"),
  JWT_REFRESH_TTL: z.string().min(1).default("7d"),
  ENABLE_REQUEST_LOGGING: booleanFromEnv.optional().default(true),
  NEWSLETTER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  NEWSLETTER_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

export const serverEnv = envSchema.parse(process.env);
```

- [ ] **Step 2: Criar Prisma singleton**

Create `src/server/db/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Criar erro HTTP**

Create `src/server/http/api-error.ts`:

```ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

- [ ] **Step 4: Criar helpers de resposta**

Create `src/server/http/api-response.ts`:

```ts
export function jsonResponse<T>(payload: T, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

export function csvResponse(fileName: string, csv: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
```

- [ ] **Step 5: Criar wrapper de route handler**

Create `src/server/http/route-handler.ts`:

```ts
import { ZodError } from "zod";
import { ApiError } from "./api-error";

export async function handleApiRoute(handler: () => Promise<Response> | Response): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ message: error.message, details: error.details }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return Response.json({ message: "Validation failed.", details: error.flatten() }, { status: 400 });
    }

    console.error(error);
    return Response.json({ message: "Internal server error." }, { status: 500 });
  }
}
```

- [ ] **Step 6: Criar parser Zod**

Create `src/server/http/validation.ts`:

```ts
import type { ZodSchema } from "zod";

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const body = await request.json().catch(() => null);
  return schema.parse(body);
}
```

- [ ] **Step 7: Atualizar `.env.example`**

Replace external API variable with server variables:

```dotenv
DATABASE_URL=postgresql://postgres:2611@localhost:5432/festival_desapegue_se_local?schema=public
DATABASE_REQUIRED=true
JWT_ACCESS_SECRET=festival-desapegue-se-local-access-secret
JWT_REFRESH_SECRET=festival-desapegue-se-local-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
ENABLE_REQUEST_LOGGING=true
NEWSLETTER_RATE_LIMIT_MAX=5
NEWSLETTER_RATE_LIMIT_WINDOW_MS=60000
NEXT_PUBLIC_ABAIXO_ASSINADO_URL=https://www.change.org/p/traga-o-novo-supercomputador-para-petrópolis-base-estratégica-para-o-pbia-e-futuro-da-ia?recruited_by_id=8e4d8240-01c7-11f1-a3cb-5b7b3b5cc122&recruiter=1402013625&utm_source=share_petition&utm_medium=qr_code&utm_campaign=starter_dashboard
```

- [ ] **Step 8: Commit infra server**

Run from frontend root:

```powershell
git add src/server/config src/server/db src/server/http .env.example
git commit -m "feat(server): add next backend infrastructure"
```

Expected: commit criado.

## Task 5: Portar Auth Para Serviços Next

**Files:**
- Create: `src/server/auth/auth-schemas.ts`
- Create: `src/server/auth/password.ts`
- Create: `src/server/auth/token.ts`
- Create: `src/server/auth/auth-service.ts`
- Create: `src/server/auth/require-auth.ts`
- Create: `src/app/api/v1/auth/register/route.ts`
- Create: `src/app/api/v1/auth/login/route.ts`
- Create: `src/app/api/v1/auth/refresh/route.ts`
- Create: `src/app/api/v1/auth/logout/route.ts`
- Create: `src/app/api/v1/auth/me/route.ts`

- [ ] **Step 1: Criar schemas**

Create `src/server/auth/auth-schemas.ts`:

```ts
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

export const registerSchema = z.strictObject({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: passwordSchema,
});

export const loginSchema = z.strictObject({
  email: z.string().email().max(160),
  password: z.string().min(1),
});

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
    refresh_token: z.string().min(1).optional(),
  })
  .refine(data => Boolean(data.refreshToken ?? data.refresh_token), {
    message: "Refresh token is required.",
    path: ["refreshToken"],
  })
  .transform(data => ({ refreshToken: data.refreshToken ?? data.refresh_token! }));
```

- [ ] **Step 2: Criar senha e tokens**

Create `src/server/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

Create `src/server/auth/token.ts`:

```ts
import { createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/server/config/env";

export type AuthRole = "ADMIN" | "MEMBER";
export type AccessTokenPayload = { sub: string; email: string; name: string; role: AuthRole; type: "access" };
export type RefreshTokenPayload = AccessTokenPayload & { type: "refresh"; jti: string };

const encoder = new TextEncoder();

export function generateTokenId(): string {
  return randomUUID();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value);
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return amount * multipliers[unit as keyof typeof multipliers];
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(serverEnv.JWT_ACCESS_TTL)
    .sign(encoder.encode(serverEnv.JWT_ACCESS_SECRET));
}

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime(serverEnv.JWT_REFRESH_TTL)
    .sign(encoder.encode(serverEnv.JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(serverEnv.JWT_ACCESS_SECRET));
  if (payload.type !== "access") throw new Error("Invalid access token.");
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, encoder.encode(serverEnv.JWT_REFRESH_SECRET));
  if (payload.type !== "refresh") throw new Error("Invalid refresh token.");
  return payload as RefreshTokenPayload;
}
```

- [ ] **Step 3: Criar serviço auth**

Create `src/server/auth/auth-service.ts` portando as funções `register`, `login`, `refresh`, `logout`, `me` da API atual. A função pública deve exportar:

```ts
export const authService = {
  register,
  login,
  refresh,
  logout,
  me,
};
```

The return shape must remain:

```ts
type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  };
};
```

- [ ] **Step 4: Criar guard de auth**

Create `src/server/auth/require-auth.ts`:

```ts
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import { verifyAccessToken, type AuthRole } from "./token";

export async function requireAuth(request: Request, role?: AuthRole) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    throw new ApiError(401, "Unauthorized.");
  }

  const payload = await verifyAccessToken(token).catch(() => null);

  if (!payload) {
    throw new ApiError(401, "Unauthorized.");
  }

  if (role && payload.role !== role) {
    throw new ApiError(403, "Forbidden.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized.");
  }

  return user;
}
```

- [ ] **Step 5: Criar route handlers de auth**

Each route must export `runtime = "nodejs"` and use `handleApiRoute`.

Example `src/app/api/v1/auth/login/route.ts`:

```ts
import { authService } from "@/server/auth/auth-service";
import { loginSchema } from "@/server/auth/auth-schemas";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const input = await parseJsonBody(request, loginSchema);
    return Response.json(await authService.login(input));
  });
}
```

Apply the same pattern for `register`, `refresh`, `logout` and `me`.

- [ ] **Step 6: Verificar auth**

Run from frontend root:

```powershell
pnpm exec tsc --noEmit
pnpm build
```

Expected: sem erros de tipos ou build.

- [ ] **Step 7: Commit auth**

Run from frontend root:

```powershell
git add src/server/auth src/app/api/v1/auth
git commit -m "feat(auth): port jwt auth into next routes"
```

Expected: commit criado.

## Task 6: Portar Landing CMS

**Files:**
- Create: `src/server/landing/landing-schemas.ts`
- Create: `src/server/landing/landing-service.ts`
- Create: `src/app/api/v1/landing-pages/default/route.ts`
- Create: `src/app/api/v1/admin/landing-pages/default/route.ts`
- Create: `src/app/api/v1/admin/landing-sections/[id]/route.ts`
- Create: `src/app/api/v1/admin/landing-sections/[sectionId]/items/route.ts`
- Create: `src/app/api/v1/admin/landing-items/[id]/route.ts`
- Create: `src/app/api/v1/admin/landing-assets/[id]/route.ts`

- [ ] **Step 1: Copiar validações Zod**

Create `src/server/landing/landing-schemas.ts` using the same schemas from the API:

```ts
import { z } from "zod";

const metadataSchema = z.record(z.string(), z.unknown()).optional();
const imageMimeTypeSchema = z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export const updateLandingPageSchema = z
  .strictObject({
    seoTitle: z.string().trim().min(1).max(180).optional(),
    seoDescription: z.string().trim().min(1).max(2000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be informed." });

export const updateLandingSectionSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(240).nullable().optional(),
    subtitle: z.string().trim().min(1).max(320).nullable().optional(),
    description: z.string().trim().min(1).max(4000).nullable().optional(),
    metadata: metadataSchema,
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be informed." });

export const createLandingItemSchema = z.strictObject({
  key: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(240).nullable().optional(),
  subtitle: z.string().trim().min(1).max(320).nullable().optional(),
  description: z.string().trim().min(1).max(4000).nullable().optional(),
  value: z.string().trim().min(1).max(80).nullable().optional(),
  icon: z.string().trim().min(1).max(80).nullable().optional(),
  color: z.string().trim().min(1).max(80).nullable().optional(),
  url: z.string().trim().url().nullable().optional(),
  metadata: metadataSchema,
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateLandingItemSchema = createLandingItemSchema
  .omit({ key: true, type: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be informed." });

export const updateLandingAssetSchema = z
  .strictObject({
    landingPageId: z.string().uuid().optional(),
    sectionId: z.string().uuid().nullable().optional(),
    itemId: z.string().uuid().nullable().optional(),
    key: z.string().trim().min(1).max(120).optional(),
    type: z.string().trim().min(1).max(80).optional(),
    theme: z.enum(["light", "dark"]).nullable().optional(),
    fileName: z.string().trim().min(1).max(220).optional(),
    mimeType: imageMimeTypeSchema.optional(),
    base64Data: z.string().trim().min(1).max(8_000_000).optional(),
    altText: z.string().trim().min(1).max(240).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be informed." });
```

- [ ] **Step 2: Portar serviço de landing**

Create `src/server/landing/landing-service.ts` by adapting `festival-desapegue-se-api/src/modules/landing/landing.service.ts`:

- Replace Nest exceptions with `new ApiError(status, message)`.
- Replace `PrismaService` injection with direct `prisma` import.
- Keep `DEFAULT_PAGE_INCLUDE`, asset includes, `mapPage`, `mapSection`, `mapItem`, `mapAsset`.
- Keep `cleanNullableText`, `cleanText`, `cleanMetadata`.
- Keep ownership validation for assets.
- Export:

```ts
export const landingService = {
  getDefaultPage,
  updateDefaultPage,
  updateSection,
  createItem,
  updateItem,
  removeItem,
  updateAsset,
};
```

- [ ] **Step 3: Criar rota pública**

Create `src/app/api/v1/landing-pages/default/route.ts`:

```ts
import { landingService } from "@/server/landing/landing-service";
import { handleApiRoute } from "@/server/http/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handleApiRoute(async () => Response.json(await landingService.getDefaultPage()));
}
```

- [ ] **Step 4: Criar rotas admin**

Example `src/app/api/v1/admin/landing-items/[id]/route.ts`:

```ts
import { requireAuth } from "@/server/auth/require-auth";
import { emptyResponse } from "@/server/http/api-response";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { landingService } from "@/server/landing/landing-service";
import { updateLandingItemSchema } from "@/server/landing/landing-schemas";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/v1/admin/landing-items/[id]">) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { id } = await context.params;
    const input = await parseJsonBody(request, updateLandingItemSchema);
    return Response.json(await landingService.updateItem(id, input));
  });
}

export async function DELETE(request: Request, context: RouteContext<"/api/v1/admin/landing-items/[id]">) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { id } = await context.params;
    await landingService.removeItem(id);
    return emptyResponse();
  });
}
```

Apply the same pattern for pages, sections, create item and assets.

- [ ] **Step 5: Verificar landing**

Run from frontend root:

```powershell
pnpm exec tsc --noEmit
pnpm build
```

Expected: sem erros.

- [ ] **Step 6: Commit landing**

Run from frontend root:

```powershell
git add src/server/landing src/app/api/v1/landing-pages src/app/api/v1/admin/landing-pages src/app/api/v1/admin/landing-sections src/app/api/v1/admin/landing-items src/app/api/v1/admin/landing-assets
git commit -m "feat(cms): port landing cms into next routes"
```

Expected: commit criado.

## Task 7: Portar Newsletter E Export CSV

**Files:**
- Create: `src/server/newsletter/newsletter-schemas.ts`
- Create: `src/server/newsletter/newsletter-rate-limit.ts`
- Create: `src/server/newsletter/newsletter-service.ts`
- Create: `src/app/api/v1/newsletter/subscriptions/route.ts`
- Create: `src/app/api/v1/admin/newsletter/subscriptions/export.csv/route.ts`

- [ ] **Step 1: Criar schema newsletter**

Create `src/server/newsletter/newsletter-schemas.ts`:

```ts
import { z } from "zod";

export const createNewsletterSubscriptionSchema = z.strictObject({
  email: z.string().trim().email().max(180),
  source: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{1,80}$/).optional(),
});
```

- [ ] **Step 2: Criar rate limit**

Create `src/server/newsletter/newsletter-rate-limit.ts`:

```ts
import { serverEnv } from "@/server/config/env";
import { ApiError } from "@/server/http/api-error";

const attempts = new Map<string, number[]>();

export function assertNewsletterRateLimit(request: Request, email: string): void {
  const now = Date.now();
  const keys = [`ip:${getClientIp(request)}`, `email:${email.trim().toLowerCase()}`];

  for (const key of keys) {
    const recent = getRecentAttempts(key, now);
    if (recent.length >= serverEnv.NEWSLETTER_RATE_LIMIT_MAX) {
      throw new ApiError(429, "Muitas tentativas de inscrição na newsletter. Tente novamente em instantes.");
    }
  }

  for (const key of keys) {
    const recent = getRecentAttempts(key, now);
    recent.push(now);
    attempts.set(key, recent);
  }
}

function getRecentAttempts(key: string, now: number): number[] {
  return (attempts.get(key) ?? []).filter(time => now - time <= serverEnv.NEWSLETTER_RATE_LIMIT_WINDOW_MS);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
```

- [ ] **Step 3: Criar service newsletter**

Create `src/server/newsletter/newsletter-service.ts`:

```ts
import { prisma } from "@/server/db/prisma";

export async function subscribeNewsletter(input: { email: string; source?: string }) {
  const email = input.email.trim().toLowerCase();
  const source = input.source?.trim().toLowerCase() || "footer";

  return prisma.newsletterSubscription.upsert({
    where: { email },
    create: { email, source, isActive: true },
    update: { source, isActive: true },
  });
}

export async function exportNewsletterCsv(): Promise<string> {
  const rows = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = ["email", "source", "isActive", "createdAt", "updatedAt"];
  const body = rows.map(row => [
    row.email,
    row.source,
    String(row.isActive),
    row.createdAt.toISOString(),
    row.updatedAt.toISOString(),
  ]);

  return [header, ...body].map(columns => columns.map(escapeCsvCell).join(",")).join("\r\n");
}

function escapeCsvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
```

- [ ] **Step 4: Criar rota pública**

Create `src/app/api/v1/newsletter/subscriptions/route.ts`:

```ts
import { createNewsletterSubscriptionSchema } from "@/server/newsletter/newsletter-schemas";
import { assertNewsletterRateLimit } from "@/server/newsletter/newsletter-rate-limit";
import { subscribeNewsletter } from "@/server/newsletter/newsletter-service";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const input = await parseJsonBody(request, createNewsletterSubscriptionSchema);
    assertNewsletterRateLimit(request, input.email);
    await subscribeNewsletter(input);

    return Response.json(
      { message: "Inscrição recebida. Se o email for válido, ele receberá nossas atualizações." },
      { status: 201 }
    );
  });
}
```

- [ ] **Step 5: Criar export CSV admin**

Create `src/app/api/v1/admin/newsletter/subscriptions/export.csv/route.ts`:

```ts
import { requireAuth } from "@/server/auth/require-auth";
import { csvResponse } from "@/server/http/api-response";
import { handleApiRoute } from "@/server/http/route-handler";
import { exportNewsletterCsv } from "@/server/newsletter/newsletter-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    return csvResponse("newsletter-festival-desapegue-se.csv", await exportNewsletterCsv());
  });
}
```

- [ ] **Step 6: Commit newsletter**

Run from frontend root:

```powershell
git add src/server/newsletter src/app/api/v1/newsletter src/app/api/v1/admin/newsletter
git commit -m "feat(newsletter): port subscriptions into next routes"
```

Expected: commit criado.

## Task 8: Health, Users E Items Para Paridade

**Files:**
- Create: `src/app/api/v1/health/route.ts`
- Create: `src/server/users/users-service.ts`
- Create: `src/server/users/users-schemas.ts`
- Create: `src/app/api/v1/users/...`
- Create: `src/server/items/items-service.ts`
- Create: `src/server/items/items-schemas.ts`
- Create: `src/app/api/v1/items/...`

- [ ] **Step 1: Criar health**

Create `src/app/api/v1/health/route.ts`:

```ts
import { prisma } from "@/server/db/prisma";
import { handleApiRoute } from "@/server/http/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handleApiRoute(async () => {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", service: "festival-desapegue-se-next", timestamp: new Date().toISOString() });
  });
}
```

- [ ] **Step 2: Portar users**

Port from API:

- `festival-desapegue-se-api/src/modules/users/users.service.ts`
- `festival-desapegue-se-api/src/modules/users/schemas/user.schema.ts`

Rules:

- `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id/role`, `PATCH /users/:id/status` require `ADMIN`.
- `GET /users/me` and `PATCH /users/me` require authenticated user.
- Public user payload must never include `passwordHash`.

- [ ] **Step 3: Portar items**

Port from API:

- `festival-desapegue-se-api/src/modules/items/items.service.ts`
- `festival-desapegue-se-api/src/modules/items/schemas/item.schema.ts`

Rules:

- All `items` routes require authenticated user.
- Created item must set `createdById` from auth user.
- Delete remains physical delete as in API current service.

- [ ] **Step 4: Commit paridade**

Run from frontend root:

```powershell
git add src/app/api/v1/health src/server/users src/app/api/v1/users src/server/items src/app/api/v1/items
git commit -m "feat(api): add health users and items parity routes"
```

Expected: commit criado.

## Task 9: Atualizar Cliente Do Front Para Same-Origin

**Files:**
- Modify: `src/lib/api/festival-api.ts`
- Modify: `.env.example`

- [ ] **Step 1: Alterar base URL padrão**

In `src/lib/api/festival-api.ts`, replace:

```ts
process.env.NEXT_PUBLIC_FESTIVAL_API_URL ??
"http://localhost:3333/api/v1"
```

with:

```ts
process.env.NEXT_PUBLIC_FESTIVAL_API_URL ??
"/api/v1"
```

Keep `NEXT_PUBLIC_FESTIVAL_API_URL` as optional override only for rollback/testing, but remove it from `.env.example`.

- [ ] **Step 2: Manter refresh token compatível**

Keep the existing body-based refresh:

```ts
body: JSON.stringify({ refreshToken: session.refreshToken })
```

Reason: this avoids UI churn in the first migration. A later hardening task can move refresh token to httpOnly cookie using Next `cookies()`.

- [ ] **Step 3: Adicionar função export CSV**

Add:

```ts
async exportNewsletterCsv(accessToken: string): Promise<Blob> {
  const response = await fetchAuthenticatedJson<Response>(
    `${baseUrl}/admin/newsletter/subscriptions/export.csv`,
    { method: "GET" },
    accessToken
  );
  return response.blob();
}
```

If `fetchAuthenticatedJson` always parses JSON, split a `fetchAuthenticatedRaw` helper so CSV is not parsed as JSON.

- [ ] **Step 4: Commit cliente**

Run from frontend root:

```powershell
git add src/lib/api/festival-api.ts .env.example
git commit -m "feat(api): use next same-origin backend"
```

Expected: commit criado.

## Task 10: Atualizar Testes E Playwright

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/e2e/landing-cms.spec.ts`
- Modify: `tests/agent-browser/visual-qa.spec.ts`
- Modify: `tests/obscura/obscura-check.ps1`

- [ ] **Step 1: Remover webServer da API Nest**

In `playwright.config.ts`, replace the two-server setup with one frontend server:

```ts
const apiBaseUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:3000/api/v1";
const webBaseUrl = process.env.E2E_WEB_URL ?? "http://127.0.0.1:3000";

webServer: [
  {
    command: "pnpm db:setup && pnpm build && pnpm exec next start -p 3000",
    cwd: frontendRoot,
    url: `${webBaseUrl}/api/v1/health`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      DATABASE_REQUIRED: "false",
    },
  },
],
```

- [ ] **Step 2: Ajustar testes para API same-origin**

Any test using `http://127.0.0.1:3333/api/v1` must use:

```ts
const apiBaseUrl = process.env.E2E_API_URL ?? `${webBaseUrl}/api/v1`;
```

- [ ] **Step 3: Rodar E2E**

Run from frontend root:

```powershell
pnpm exec playwright test tests/e2e --project=chromium
```

Expected: fluxo admin, troca de texto, troca de imagem, newsletter e refresh token passam contra o Next backend.

- [ ] **Step 4: Rodar visual QA e Obscura**

Run from frontend root:

```powershell
pnpm exec playwright test tests/agent-browser --project=chromium
pnpm test:obscura
```

Expected: ambos passam sem depender da API Nest.

- [ ] **Step 5: Commit testes**

Run from frontend root:

```powershell
git add playwright.config.ts tests
git commit -m "test(api): run cms flows against next backend"
```

Expected: commit criado.

## Task 11: Configuração De Produção

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: docs de deploy existentes, se houver.

- [ ] **Step 1: Documentar variáveis obrigatórias**

Document:

```dotenv
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
DATABASE_REQUIRED=true
ENABLE_REQUEST_LOGGING=true
NEWSLETTER_RATE_LIMIT_MAX=5
NEWSLETTER_RATE_LIMIT_WINDOW_MS=60000
```

- [ ] **Step 2: Documentar comandos de deploy**

Add production sequence:

```powershell
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm prisma:deploy
pnpm db:seed
pnpm build
pnpm start
```

For Vercel or similar serverless hosting, note that migrations and seed must run in CI/deploy job before serving traffic.

- [ ] **Step 3: Documentar rollback**

Add rollback path:

- Keep `NEXT_PUBLIC_FESTIVAL_API_URL` override supported temporarily.
- If embedded routes fail in staging, set `NEXT_PUBLIC_FESTIVAL_API_URL` to the old API URL and redeploy the front.
- Do not shut down the API Nest until Playwright, manual admin flow and production smoke pass.

- [ ] **Step 4: Commit docs**

Run from frontend root:

```powershell
git add README.md .env.example
git commit -m "docs: document embedded backend deployment"
```

Expected: commit criado.

## Task 12: Validação Final

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Gerar Prisma client**

Run from frontend root:

```powershell
pnpm prisma:generate
```

Expected: Prisma client generated.

- [ ] **Step 2: Aplicar migrations no banco local**

Run from frontend root:

```powershell
pnpm prisma:deploy
```

Expected: migrations aplicadas no PostgreSQL atual sem recriar banco.

- [ ] **Step 3: Rodar seed**

Run from frontend root:

```powershell
pnpm db:seed
```

Expected: admin e landing default criados/atualizados.

- [ ] **Step 4: Build**

Run from frontend root:

```powershell
pnpm build
```

Expected: build passa.

- [ ] **Step 5: TypeScript**

Run from frontend root:

```powershell
pnpm exec tsc --noEmit
```

Expected: TypeScript passa.

- [ ] **Step 6: Playwright E2E**

Run from frontend root:

```powershell
pnpm exec playwright test tests/e2e --project=chromium
```

Expected: a suíte completa passa.

- [ ] **Step 7: Agent browser**

Run from frontend root:

```powershell
pnpm exec playwright test tests/agent-browser --project=chromium
```

Expected: testes visuais passam.

- [ ] **Step 8: Obscura**

Run from frontend root:

```powershell
pnpm test:obscura
```

Expected: passa contra `http://127.0.0.1:3000`.

- [ ] **Step 9: Smoke manual**

Start:

```powershell
pnpm dev
```

Validate:

1. `http://localhost:3000/api/v1/health` retorna `status: "ok"`.
2. `http://localhost:3000/pt` renderiza a landing.
3. Login admin em `http://localhost:3000/pt/admin/login`.
4. Editar um texto e ver a troca imediata sem refresh manual.
5. Trocar uma imagem do carrossel e confirmar que ela aparece nos modos claro e escuro.
6. Trocar logo claro e confirmar que a logo escura não muda.
7. Inscrever e-mail de newsletter.
8. Exportar CSV no modo admin.
9. Esperar access token expirar ou simular 401 e confirmar refresh token funcionando.

- [ ] **Step 10: Commit final**

Run from frontend root:

```powershell
git status --short
git add .
git commit -m "feat(api): embed festival backend in next"
```

Expected: commit criado somente se houver mudanças não commitadas dos passos de correção.

## Task 13: Desativação Segura Da API Nest

**Files:**
- Modify: deployment docs only.

- [ ] **Step 1: Manter API Nest durante staging**

Do not delete or archive `festival-desapegue-se-api` until:

- Next backend passed staging smoke.
- Production Postgres has migrations.
- Admin login works in production.
- Newsletter CSV export works in production.
- Rollback variable was tested or intentionally removed.

- [ ] **Step 2: Marcar API como legado**

After production pass, add a note to the API README:

```md
# Legacy API

Este backend foi substituído pelos Route Handlers do Next.js no projeto `festival-desapegue-se-landingage`.
Manter este repositório apenas para histórico e rollback temporário até a estabilização do deploy.
```

- [ ] **Step 3: Arquivar deploy antigo**

Remove scheduled deploys or hosting from the API only after the front has been running with the embedded backend in production.

## Riscos E Mitigações

- **Payload de imagens Base64 continua grande.** Mitigação: manter comportamento atual na migração e avaliar storage externo depois, sem misturar com esta troca arquitetural.
- **Route Handlers são endpoints públicos.** Mitigação: toda mutação admin chama `requireAuth(request, "ADMIN")`.
- **Serverless e Prisma exigem atenção a conexões.** Mitigação: usar Prisma singleton e escolher hospedagem compatível com Postgres; se for Vercel, considerar pooler do provedor de banco.
- **Tokens atuais podem invalidar se secrets mudarem.** Mitigação: usar os mesmos `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` na migração ou aceitar logout global controlado.
- **Seed pode sobrescrever conteúdo editado se rodar em produção repetidamente.** Mitigação: seed atual usa upsert e atualiza defaults; antes de produção, decidir se `db:seed` deve rodar apenas na primeira implantação ou se deve preservar campos editados.
- **API Nest ainda possui Swagger/Redoc.** Mitigação: Insomnia passa a ser a documentação operacional; se necessário, gerar OpenAPI estático depois.

## Critérios De Aceite

- O front sobe sozinho com `pnpm dev` e responde `/api/v1/health`.
- A landing pública lê conteúdo do PostgreSQL via Route Handler Next.
- O modo admin salva textos, números, cards e imagens sem depender da API Nest.
- A visualização muda imediatamente após salvar, mantendo o comportamento já corrigido no contexto local.
- Refresh token continua funcionando.
- Newsletter grava e-mails no PostgreSQL e exporta CSV no admin.
- Banco atual PostgreSQL é preservado; nenhuma migração recria tabelas ou perde dados.
- Build passa.
- Playwright E2E, agent-browser e Obscura passam contra o backend embutido.
- A API Nest pode ficar desligada localmente sem quebrar a landing ou o admin.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-next-embedded-backend.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh worker per task, review between tasks, faster for this migration.
2. **Inline Execution** - execute tasks in this session using checkpoints, slower but easier to audit step by step.
