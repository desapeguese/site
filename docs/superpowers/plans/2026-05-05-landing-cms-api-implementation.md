# Landing CMS API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PostgreSQL-backed CMS API and inline admin editing flow so all Festival Desapegue-se landing content can be changed from the page itself after admin login.

**Architecture:** The NestJS API in the sibling `festival-desapegue-se-api` repository becomes the source of truth for landing content, assets in Base64, admin auth and newsletter subscriptions. The Next.js landing keeps its current visual structure but receives dynamic content from `GET /api/v1/landing-pages/default`; admin-only inline editors call protected API endpoints and publish changes immediately.

**Tech Stack:** NestJS 11, Prisma 6, PostgreSQL, Jest, Zod, Next.js 15, React 18, TypeScript, Tailwind, sonner, next-themes, Vitest for frontend unit tests.

---

## Repository Roots

- Frontend: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage`
- API: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api`

Run commands from the root shown in each task. Preserve UTF-8 and Portuguese accents in every edited file.

## File Structure

### API files

- Modify: `prisma/schema.prisma` - add CMS and newsletter models.
- Modify: `prisma/seed.ts` - seed admin user plus default landing content and Base64 assets.
- Modify: `.env.example` - Festival-specific local settings.
- Modify: `docker-compose.local.yml` - Festival-specific container, database and password.
- Modify: `README.md` - update project name, local database and seed credentials.
- Modify: `src/app.module.ts` - register landing and newsletter modules.
- Create: `src/modules/landing/default-landing-content.ts` - source data copied from the current landing.
- Create: `src/modules/landing/landing.types.ts` - public payload and update input types.
- Create: `src/modules/landing/landing-assets.util.ts` - asset normalization and Base64 helpers.
- Create: `src/modules/landing/schemas/landing.schema.ts` - Zod validation for page, section, item and asset updates.
- Create: `src/modules/landing/dto/*.ts` - Swagger DTOs for admin payloads.
- Create: `src/modules/landing/entities/*.ts` - response entities for public payload and admin updates.
- Create: `src/modules/landing/landing.service.ts` - public read, admin updates and ordering logic.
- Create: `src/modules/landing/landing.controller.ts` - public landing endpoint.
- Create: `src/modules/landing/admin-landing.controller.ts` - protected admin endpoints.
- Create: `src/modules/landing/landing.module.ts` - module wiring.
- Create: `src/modules/landing/landing.service.spec.ts` - unit tests for public payload and admin updates.
- Create: `src/modules/landing/default-landing-content.spec.ts` - tests for seed defaults.
- Create: `src/modules/newsletter/schemas/newsletter.schema.ts` - Zod email validation.
- Create: `src/modules/newsletter/dto/create-newsletter-subscription.dto.ts` - Swagger DTO.
- Create: `src/modules/newsletter/entities/newsletter-subscription.entity.ts` - response entity.
- Create: `src/modules/newsletter/newsletter.service.ts` - subscription persistence.
- Create: `src/modules/newsletter/newsletter.controller.ts` - public newsletter route.
- Create: `src/modules/newsletter/newsletter.module.ts` - module wiring.
- Create: `src/modules/newsletter/newsletter.service.spec.ts` - unit tests for uniqueness and normalization.
- Modify: `test/app.e2e-spec.ts` - add mocked e2e coverage for landing, newsletter and admin authorization.

### Frontend files

- Modify: `package.json` - add test scripts and frontend test dependencies.
- Create: `vitest.config.ts` - Vitest configuration.
- Create: `src/test/setup.ts` - jest-dom setup.
- Modify: `.env.example` - add API base URL.
- Create: `src/lib/api/festival-api.ts` - typed API client.
- Create: `src/lib/api/festival-api.test.ts` - API client tests.
- Create: `src/lib/landing/default-content.ts` - local fallback content matching API payload shape.
- Create: `src/lib/landing/types.ts` - frontend landing payload types.
- Create: `src/lib/admin/admin-session.ts` - token storage and admin session helpers.
- Create: `src/lib/admin/admin-session.test.ts` - session helper tests.
- Create: `src/lib/admin/file-to-base64.ts` - upload conversion helper.
- Create: `src/lib/admin/file-to-base64.test.ts` - Base64 helper tests.
- Create: `src/context/AdminModeContext.tsx` - admin mode provider.
- Create: `src/components/admin/EditableText.tsx` - inline text editor.
- Create: `src/components/admin/EditableImage.tsx` - image upload editor.
- Create: `src/components/admin/EditableCardToolbar.tsx` - edit/reorder/remove controls.
- Create: `src/components/admin/AdminFloatingBar.tsx` - active admin status and logout.
- Create: `src/app/[locale]/admin/login/page.tsx` - admin login route.
- Modify: `src/app/[locale]/(landing-page)/(root)/_components/PageContainer.tsx` - load dynamic content and pass props.
- Modify: all landing section components under `src/app/[locale]/(landing-page)/(root)/_components` - receive typed data and enable inline editing.
- Modify: `src/components/footer/footer.tsx` - use newsletter API and dynamic footer content.

---

## Task 1: API Schema And Local Environment

**Files:**
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\prisma\schema.prisma`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\.env.example`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\docker-compose.local.yml`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\README.md`

- [ ] **Step 1: Run the current Prisma validation**

Run from API root:

```powershell
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
pnpm exec prisma validate
```

Expected: PASS with the current schema before edits.

- [ ] **Step 2: Add CMS and newsletter models to Prisma schema**

Add these models after `Item` in `prisma/schema.prisma`:

```prisma
model LandingPage {
  id             String           @id @default(uuid())
  slug           String           @unique @db.VarChar(80)
  locale         String           @default("pt-BR") @db.VarChar(16)
  seoTitle       String           @map("seo_title") @db.VarChar(180)
  seoDescription String           @map("seo_description") @db.Text
  isActive       Boolean          @default(true) @map("is_active")
  sections       LandingSection[]
  assets         LandingAsset[]
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  @@index([slug])
  @@index([isActive])
  @@map("landing_pages")
}

model LandingSection {
  id            String        @id @default(uuid())
  landingPageId String        @map("landing_page_id")
  landingPage   LandingPage   @relation(fields: [landingPageId], references: [id], onDelete: Cascade)
  key           String        @db.VarChar(80)
  type          String        @db.VarChar(80)
  title         String?       @db.VarChar(240)
  subtitle      String?       @db.VarChar(320)
  description   String?       @db.Text
  metadata      Json?
  sortOrder     Int           @default(0) @map("sort_order")
  isActive      Boolean       @default(true) @map("is_active")
  items         LandingItem[]
  assets        LandingAsset[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@unique([landingPageId, key])
  @@index([landingPageId, sortOrder])
  @@index([isActive])
  @@map("landing_sections")
}

model LandingItem {
  id        String         @id @default(uuid())
  sectionId String         @map("section_id")
  section   LandingSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  key       String         @db.VarChar(100)
  type      String         @db.VarChar(80)
  title     String?        @db.VarChar(240)
  subtitle  String?        @db.VarChar(320)
  description String?      @db.Text
  value     String?        @db.VarChar(80)
  icon      String?        @db.VarChar(80)
  color     String?        @db.VarChar(80)
  url       String?        @db.Text
  metadata  Json?
  sortOrder Int            @default(0) @map("sort_order")
  isActive  Boolean        @default(true) @map("is_active")
  assets    LandingAsset[]
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")

  @@unique([sectionId, key])
  @@index([sectionId, sortOrder])
  @@index([type])
  @@index([isActive])
  @@map("landing_items")
}

model LandingAsset {
  id            String          @id @default(uuid())
  landingPageId String          @map("landing_page_id")
  landingPage   LandingPage     @relation(fields: [landingPageId], references: [id], onDelete: Cascade)
  sectionId     String?         @map("section_id")
  section       LandingSection? @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  itemId        String?         @map("item_id")
  item          LandingItem?    @relation(fields: [itemId], references: [id], onDelete: Cascade)
  key           String          @db.VarChar(120)
  type          String          @db.VarChar(80)
  theme         String?         @db.VarChar(20)
  fileName      String          @map("file_name") @db.VarChar(220)
  mimeType      String          @map("mime_type") @db.VarChar(80)
  base64Data    String          @map("base64_data") @db.Text
  altText       String          @map("alt_text") @db.VarChar(240)
  sortOrder     Int             @default(0) @map("sort_order")
  isActive      Boolean         @default(true) @map("is_active")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  @@unique([landingPageId, key])
  @@index([landingPageId, sortOrder])
  @@index([sectionId])
  @@index([itemId])
  @@index([isActive])
  @@map("landing_assets")
}

model NewsletterSubscription {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(180)
  source    String   @default("footer") @db.VarChar(80)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([createdAt])
  @@index([isActive])
  @@map("newsletter_subscriptions")
}
```

- [ ] **Step 3: Update local API environment defaults**

Replace Festival-specific values in `.env.example`:

```dotenv
NODE_ENV=development
APP_NAME=Festival Desapegue-se API
APP_DESCRIPTION=API de conteúdo, autenticação e newsletter do Festival Desapegue-se.
PORT=3333
API_PREFIX=api
API_VERSION=1
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
DATABASE_URL=postgresql://postgres:2611@localhost:5432/festival_desapegue_se_local?schema=public
DATABASE_REQUIRED=true
ENABLE_REQUEST_LOGGING=true
JWT_ACCESS_SECRET=festival-desapegue-se-local-access-secret
JWT_REFRESH_SECRET=festival-desapegue-se-local-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
SWAGGER_PATH=docs/swagger
REDOC_PATH=docs
SENHA_POSTGRESS=2611
```

- [ ] **Step 4: Update Docker Compose local database**

Set `docker-compose.local.yml` to use:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: festival-desapegue-se-local-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: festival_desapegue_se_local
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "2611"
    ports:
      - "5432:5432"
    volumes:
      - festival_desapegue_se_local_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d festival_desapegue_se_local"]
      interval: 5s
      timeout: 5s
      retries: 12

volumes:
  festival_desapegue_se_local_pgdata:
```

- [ ] **Step 5: Validate schema**

Run from API root:

```powershell
pnpm exec prisma validate
```

Expected: PASS.

- [ ] **Step 6: Create migration**

Run from API root:

```powershell
pnpm prisma:migrate:create -- --name add_landing_cms
```

Expected: a new folder under `prisma/migrations` with SQL for `landing_pages`, `landing_sections`, `landing_items`, `landing_assets` and `newsletter_subscriptions`.

- [ ] **Step 7: Commit API schema and env changes**

Run from API root:

```powershell
git add prisma/schema.prisma prisma/migrations .env.example docker-compose.local.yml README.md
git commit -m "feat(cms): add landing content schema"
```

Expected: commit succeeds.

---

## Task 2: API Default Landing Content

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\default-landing-content.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\default-landing-content.spec.ts`

- [ ] **Step 1: Write the failing default content test**

Create `src/modules/landing/default-landing-content.spec.ts`:

```ts
import { DEFAULT_LANDING_CONTENT } from './default-landing-content';

describe('DEFAULT_LANDING_CONTENT', () => {
  it('contains the current hero content and carousel assets', () => {
    expect(DEFAULT_LANDING_CONTENT.page.slug).toBe('default');
    expect(DEFAULT_LANDING_CONTENT.page.seoTitle).toContain('Festival Desapegue-se');

    const hero = DEFAULT_LANDING_CONTENT.sections.find(section => section.key === 'hero');
    expect(hero?.title).toBe('Festival Desapegue-se');
    expect(hero?.description).toContain('economia circular');
    expect(hero?.assets.filter(asset => asset.type === 'image')).toHaveLength(14);
    expect(hero?.assets.some(asset => asset.key === 'main_logo_light')).toBe(true);
    expect(hero?.assets.some(asset => asset.key === 'main_logo_dark')).toBe(true);
  });

  it('contains editable cards, statistics and timeline defaults', () => {
    const regenerar = DEFAULT_LANDING_CONTENT.sections.find(section => section.key === 'regenerar');
    const compromissos = DEFAULT_LANDING_CONTENT.sections.find(section => section.key === 'compromissos');
    const trajetoria = DEFAULT_LANDING_CONTENT.sections.find(section => section.key === 'trajetoria');

    expect(regenerar?.items.filter(item => item.type === 'pillar_card')).toHaveLength(4);
    expect(regenerar?.items.filter(item => item.type === 'stat')).toHaveLength(5);
    expect(compromissos?.items.filter(item => item.type === 'commitment_card')).toHaveLength(8);
    expect(trajetoria?.items.filter(item => item.type === 'timeline_event')).toHaveLength(8);
  });

  it('contains newsletter and footer defaults', () => {
    const footer = DEFAULT_LANDING_CONTENT.sections.find(section => section.key === 'footer');

    expect(footer?.title).toBe('Inscreva-se na Transformação');
    expect(footer?.items.some(item => item.key === 'instagram')).toBe(true);
    expect(footer?.items.some(item => item.key === 'privacy_policy')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/default-landing-content.spec.ts --runInBand
```

Expected: FAIL because `default-landing-content.ts` does not exist.

- [ ] **Step 3: Create the default content module**

Create `src/modules/landing/default-landing-content.ts` with typed serializable data. Use this shape:

```ts
export type DefaultLandingAsset = {
  key: string;
  type: 'logo' | 'image' | 'background';
  theme?: 'light' | 'dark';
  fileName: string;
  sourcePath: string;
  mimeType: string;
  altText: string;
  sortOrder: number;
};

export type DefaultLandingItem = {
  key: string;
  type:
    | 'pillar_card'
    | 'stat'
    | 'commitment_card'
    | 'timeline_event'
    | 'program_event'
    | 'thematic_space'
    | 'ods_logo'
    | 'footer_link'
    | 'social_link'
    | 'cta_link';
  title?: string;
  subtitle?: string;
  description?: string;
  value?: string;
  icon?: string;
  color?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
};

export type DefaultLandingSection = {
  key: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
  items: DefaultLandingItem[];
  assets: DefaultLandingAsset[];
};

export const DEFAULT_LANDING_CONTENT = {
  page: {
    slug: 'default',
    locale: 'pt-BR',
    seoTitle: 'Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte',
    seoDescription:
      'Festival itinerante de sustentabilidade, economia circular, arte e conexão. 19 a 22 de Março 2026 no Grajaú, Rio de Janeiro. Feira de trocas, oficinas, shows e muito mais!',
  },
  sections: [
    {
      key: 'hero',
      type: 'hero_carousel',
      title: 'Festival Desapegue-se',
      description:
        'Um festival itinerante de sustentabilidade, economia circular, arte e conexão. Mais que um evento, é um movimento de construção coletiva para cidades sustentáveis através da educação.',
      metadata: { helperText: 'Autoplay Ativo • Clique para expandir' },
      sortOrder: 10,
      items: [],
      assets: [
        {
          key: 'main_logo_dark',
          type: 'logo',
          theme: 'dark',
          fileName: 'Logo DESAPEGUE-SE branco horz 2025.png',
          sourcePath: 'public/img/Logo DESAPEGUE-SE branco horz 2025.png',
          mimeType: 'image/png',
          altText: 'Logo Festival Desapegue-se',
          sortOrder: 1,
        },
        {
          key: 'main_logo_light',
          type: 'logo',
          theme: 'light',
          fileName: 'Logo DESAPEGUE-SE verde horz 2025.png',
          sourcePath: 'public/img/Logo DESAPEGUE-SE verde horz 2025.png',
          mimeType: 'image/png',
          altText: 'Logo Festival Desapegue-se',
          sortOrder: 2,
        },
        {
          key: 'hero_carousel_01',
          type: 'image',
          fileName: 'dançacircular.jpg',
          sourcePath: 'public/img/carousel/dançacircular.jpg',
          mimeType: 'image/jpeg',
          altText: 'Dança circular no Festival Desapegue-se',
          sortOrder: 1,
        },
        {
          key: 'hero_carousel_02',
          type: 'image',
          fileName: 'expositores.jpg',
          sourcePath: 'public/img/carousel/expositores.jpg',
          mimeType: 'image/jpeg',
          altText: 'Expositores do Festival Desapegue-se',
          sortOrder: 2,
        },
        {
          key: 'hero_carousel_03',
          type: 'image',
          fileName: 'festival20.jpg',
          sourcePath: 'public/img/carousel/festival20.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 3,
        },
        {
          key: 'hero_carousel_04',
          type: 'image',
          fileName: 'festival21.jpg',
          sourcePath: 'public/img/carousel/festival21.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 4,
        },
        {
          key: 'hero_carousel_05',
          type: 'image',
          fileName: 'festival22.jpg',
          sourcePath: 'public/img/carousel/festival22.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 5,
        },
        {
          key: 'hero_carousel_06',
          type: 'image',
          fileName: 'festival30.jpg',
          sourcePath: 'public/img/carousel/festival30.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 6,
        },
        {
          key: 'hero_carousel_07',
          type: 'image',
          fileName: 'festival31.jpg',
          sourcePath: 'public/img/carousel/festival31.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 7,
        },
        {
          key: 'hero_carousel_08',
          type: 'image',
          fileName: 'festival32.jpg',
          sourcePath: 'public/img/carousel/festival32.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 8,
        },
        {
          key: 'hero_carousel_09',
          type: 'image',
          fileName: 'festival33.jpg',
          sourcePath: 'public/img/carousel/festival33.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 9,
        },
        {
          key: 'hero_carousel_10',
          type: 'image',
          fileName: 'festival34.jpg',
          sourcePath: 'public/img/carousel/festival34.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 10,
        },
        {
          key: 'hero_carousel_11',
          type: 'image',
          fileName: 'festival35.jpg',
          sourcePath: 'public/img/carousel/festival35.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 11,
        },
        {
          key: 'hero_carousel_12',
          type: 'image',
          fileName: 'cultura.jpg',
          sourcePath: 'public/img/carousel/cultura.jpg',
          mimeType: 'image/jpeg',
          altText: 'Atividade cultural no Festival Desapegue-se',
          sortOrder: 12,
        },
        {
          key: 'hero_carousel_13',
          type: 'image',
          fileName: 'festival36.jpg',
          sourcePath: 'public/img/carousel/festival36.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 13,
        },
        {
          key: 'hero_carousel_14',
          type: 'image',
          fileName: 'festival37.jpg',
          sourcePath: 'public/img/festival37.jpg',
          mimeType: 'image/jpeg',
          altText: 'Registro do Festival Desapegue-se',
          sortOrder: 14,
        },
      ],
    },
    {
      key: 'regenerar',
      type: 'cards_and_stats',
      title: 'Desapegar para Regenerar',
      description:
        'Desapegar de crenças, hábitos e atitudes e sonhar um futuro é essencial para a construção de um mundo mais justo, responsável e resiliente.',
      sortOrder: 20,
      assets: [],
      items: [
        {
          key: 'sustentabilidade',
          type: 'pillar_card',
          title: 'Sustentabilidade',
          description: 'Promovemos práticas sustentáveis e regenerativas para o território',
          icon: 'Leaf',
          color: 'bg-espacos-verde-escuro',
          sortOrder: 1,
        },
        {
          key: 'economia-circular',
          type: 'pillar_card',
          title: 'Economia Circular',
          description: 'Incentivamos o reuso, a troca e a ressignificação de objetos',
          icon: 'Recycle',
          color: 'bg-espacos-roxo',
          sortOrder: 2,
        },
        {
          key: 'conexao-comunitaria',
          type: 'pillar_card',
          title: 'Conexão Comunitária',
          description: 'Fortalecemos laços entre pessoas e territórios.',
          icon: 'Users',
          color: 'bg-secondary',
          sortOrder: 3,
        },
        {
          key: 'arte-cultura',
          type: 'pillar_card',
          title: 'Arte & Cultura',
          description: 'Arte e cultura como forma de sensibilização para criação de um mundo mais justo.',
          icon: 'Heart',
          color: 'bg-espacos-magenta',
          sortOrder: 4,
        },
        { key: 'edicoes', type: 'stat', value: '+120', title: 'edições', sortOrder: 10 },
        { key: 'pessoas-impactadas', type: 'stat', value: '+360k', title: 'pessoas impactadas', sortOrder: 11 },
        { key: 'oficinas-realizadas', type: 'stat', value: '+400', title: 'oficinas realizadas', sortOrder: 12 },
        { key: 'parceiros', type: 'stat', value: '+1000', title: 'parceiros', sortOrder: 13 },
        { key: 'anos-historias', type: 'stat', value: '+18', title: 'anos de histórias', sortOrder: 14 },
      ],
    },
    {
      key: 'compromissos',
      type: 'commitment_grid',
      title: 'Nossos Compromissos',
      description: 'Certificações e práticas que garantem um evento verdadeiramente sustentável',
      sortOrder: 30,
      assets: [],
      items: [
        { key: 'lixo-zero', type: 'commitment_card', title: 'Lixo Zero', icon: 'Recycle', color: '#1B3226', sortOrder: 1 },
        { key: 'iso-20121', type: 'commitment_card', title: 'ISO 20121:2024', icon: 'Award', color: '#fa9c38', sortOrder: 2 },
        { key: 'plastico-zero', type: 'commitment_card', title: 'Plástico Zero', icon: 'Package', color: '#27684A', sortOrder: 3 },
        { key: 'carbono-neutro', type: 'commitment_card', title: 'Carbono Neutro', icon: 'Leaf', color: '#e08e37', sortOrder: 4 },
        { key: 'diversidade-inclusao', type: 'commitment_card', title: 'Diversidade e Inclusão', icon: 'Users', color: '#92C56E', sortOrder: 5 },
        { key: 'alimentacao-sem-carne', type: 'commitment_card', title: 'Praça de Alimentação sem Carne', icon: 'UtensilsCrossed', color: '#f4b36d', sortOrder: 6 },
        { key: 'pet-friendly', type: 'commitment_card', title: 'Pet Friendly', icon: 'PawPrint', color: '#34681A', sortOrder: 7 },
        { key: 'evento-acessivel', type: 'commitment_card', title: 'Evento Acessível', icon: 'Accessibility', color: '#E46095', sortOrder: 8 },
      ],
    },
    {
      key: 'trajetoria',
      type: 'timeline',
      title: 'Nossa Trajetória',
      sortOrder: 50,
      assets: [],
      items: [
        { key: '2008', type: 'timeline_event', value: '2008', description: '1ª edição como parte do projeto Bairro Vivo da Casa Anitcha', sortOrder: 1 },
        { key: '2010', type: 'timeline_event', value: '2010', description: 'Integra a rede internacional Transition Towns - Cidades em Transição', sortOrder: 2 },
        { key: '2015-horta', type: 'timeline_event', value: '2015', description: 'Criação da Horta Urbana Comunitária do Grajaú', sortOrder: 3 },
        { key: '2015-2016-acao-local', type: 'timeline_event', value: '2015/6', description: 'Chancela da Prefeitura do Rio como Ação Local', sortOrder: 4 },
        { key: '2018', type: 'timeline_event', value: '2018', description: 'Reconhecido pela lei nº 6.396 como de interesse cultural, social e ecológico para o Município do RJ', sortOrder: 5 },
        { key: '2019', type: 'timeline_event', value: '2019', description: 'Reestruturação com apoio do projeto USIS - Unidade de Suporte à Inovação Social, da UFRJ', sortOrder: 6 },
        { key: '2020', type: 'timeline_event', value: '2020', description: 'Lançamento da moeda NIT', sortOrder: 7 },
        { key: '2026', type: 'timeline_event', value: '2026', description: 'Relançamento: + Inovação + Parcerias + Sustentabilidade + Impacto', sortOrder: 8 },
      ],
    },
    {
      key: 'footer',
      type: 'footer',
      title: 'Inscreva-se na Transformação',
      description:
        'Receba insights exclusivos e atualize seu conhecimento sobre acessibilidade e sustentabilidade. Envie seu email para ficar por dentro de tudo.',
      sortOrder: 80,
      assets: [],
      items: [
        { key: 'community_whatsapp', type: 'cta_link', title: 'Entrar na comunidade', icon: 'MessageCircle', url: 'https://chat.whatsapp.com/CNxct8e2FNHFuFyrd37Bu', sortOrder: 1 },
        { key: 'privacy_policy', type: 'footer_link', title: 'Política de Cookies e Privacidade', url: 'https://drive.google.com/file/d/1KuGn5gAqfZel-jCTV0N4mEZ-pWK4RLe7/view?usp=drive_link', metadata: { group: 'Políticas' }, sortOrder: 2 },
        { key: 'sustainability_policy', type: 'footer_link', title: 'Política de Sustentabilidade', url: 'https://drive.google.com/file/d/1jvQW1k0ackW8d42DGa1vB_uZTqKbH_S5/view?usp=drive_link', metadata: { group: 'Políticas' }, sortOrder: 3 },
        { key: 'instagram', type: 'social_link', title: 'Instagram', icon: 'Instagram', url: 'https://www.instagram.com/festivaldesapeguese', sortOrder: 10 },
        { key: 'facebook', type: 'social_link', title: 'Facebook', icon: 'Facebook', url: 'https://www.facebook.com/festivaldesapeguese', sortOrder: 11 },
        { key: 'youtube', type: 'social_link', title: 'Youtube', icon: 'Youtube', url: 'https://www.youtube.com/@FestivalDesapeguese', sortOrder: 12 },
      ],
    },
  ],
} satisfies {
  page: {
    slug: string;
    locale: string;
    seoTitle: string;
    seoDescription: string;
  };
  sections: DefaultLandingSection[];
};
```

Insert these three section objects between `compromissos` and `trajetoria`:

```ts
    {
      key: 'missao',
      type: 'mission',
      title: 'Nossa Missão',
      description:
        'Implementar os Objetivos Globais para o Desenvolvimento Sustentável (ODSs) e a Agenda 2030, promovendo a regeneração dos territórios através do foco em Cidades e Comunidades Sustentáveis, Consumo e Produção Responsáveis, Ação contra a Mudança Global do Clima e Parcerias e Meios de Implementação.',
      sortOrder: 40,
      items: [
        { key: 'ods-11', type: 'ods_logo', title: 'ODS 11 - Cidades Sustentáveis', sortOrder: 1 },
        { key: 'ods-12', type: 'ods_logo', title: 'ODS 12 - Consumo Responsável', sortOrder: 2 },
        { key: 'ods-13', type: 'ods_logo', title: 'ODS 13 - Ação Climática', sortOrder: 3 },
        { key: 'ods-17', type: 'ods_logo', title: 'ODS 17 - Parcerias', sortOrder: 4 },
      ],
      assets: [
        { key: 'ods_11_logo', type: 'image', fileName: 'ods11.jpg', sourcePath: 'public/img/carousel/ods11.jpg', mimeType: 'image/jpeg', altText: 'Logo ODS 11 - Cidades Sustentáveis', sortOrder: 1 },
        { key: 'ods_12_logo', type: 'image', fileName: 'ods12.webp', sourcePath: 'public/img/carousel/ods12.webp', mimeType: 'image/webp', altText: 'Logo ODS 12 - Consumo Responsável', sortOrder: 2 },
        { key: 'ods_13_logo', type: 'image', fileName: 'ods13.webp', sourcePath: 'public/img/carousel/ods13.webp', mimeType: 'image/webp', altText: 'Logo ODS 13 - Ação Climática', sortOrder: 3 },
        { key: 'ods_17_logo', type: 'image', fileName: 'ods17.jpg', sourcePath: 'public/img/carousel/ods17.jpg', mimeType: 'image/jpeg', altText: 'Logo ODS 17 - Parcerias', sortOrder: 4 },
        { key: 'mission_background_01', type: 'background', fileName: 'festival7.jpg', sourcePath: 'public/img/carousel/festival7.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Nossa Missão', sortOrder: 10 },
        { key: 'mission_background_02', type: 'background', fileName: 'festival8.jpg', sourcePath: 'public/img/carousel/festival8.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Nossa Missão', sortOrder: 11 },
        { key: 'mission_background_03', type: 'background', fileName: 'festival9.jpg', sourcePath: 'public/img/carousel/festival9.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Nossa Missão', sortOrder: 12 },
        { key: 'mission_background_04', type: 'background', fileName: 'festival10.jpg', sourcePath: 'public/img/carousel/festival10.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Nossa Missão', sortOrder: 13 },
        { key: 'mission_background_05', type: 'background', fileName: 'festival11.jpg', sourcePath: 'public/img/carousel/festival11.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Nossa Missão', sortOrder: 14 },
      ],
    },
    {
      key: 'reconhecimento',
      type: 'legal_recognition',
      title: 'Reconhecimento Legal',
      subtitle: 'Lei Municipal nº 6.396/2018',
      description:
        'O Festival Desapegue-se é reconhecido pela lei municipal 6.396 de 2018 como de interesse cultural, social e ecológico para o Município do Rio de Janeiro.',
      sortOrder: 60,
      items: [],
      assets: [
        { key: 'legal_background_01', type: 'background', fileName: 'festival1.jpg', sourcePath: 'public/img/carousel/festival1.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Reconhecimento Legal', sortOrder: 1 },
        { key: 'legal_background_02', type: 'background', fileName: 'festival2.jpg', sourcePath: 'public/img/carousel/festival2.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Reconhecimento Legal', sortOrder: 2 },
        { key: 'legal_background_03', type: 'background', fileName: 'festival4.jpg', sourcePath: 'public/img/carousel/festival4.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Reconhecimento Legal', sortOrder: 3 },
        { key: 'legal_background_04', type: 'background', fileName: 'festival5.jpg', sourcePath: 'public/img/carousel/festival5.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Reconhecimento Legal', sortOrder: 4 },
        { key: 'legal_background_05', type: 'background', fileName: 'festival6.jpg', sourcePath: 'public/img/carousel/festival6.jpg', mimeType: 'image/jpeg', altText: 'Imagem de fundo da seção Reconhecimento Legal', sortOrder: 5 },
      ],
    },
    {
      key: 'programacao',
      type: 'schedule_and_spaces',
      title: 'Edição Março 2026',
      description:
        'Nesta edição, o Festival Desapegue-se escolhe falar sobre justiça climática porque as mudanças no clima já estão acontecendo, e seus impactos não são iguais para todos. Justiça climática é reconhecer essas desigualdades e buscar soluções que sejam justas, coletivas e possíveis, garantindo apoio a quem mais precisa para enfrentar os novos desafios.',
      sortOrder: 70,
      assets: [],
      items: [
        { key: 'evento-19-03', type: 'program_event', value: '19/03', title: 'Quinta-feira', subtitle: 'Escola Municipal Duque de Caxias', description: 'Ação educativa com oficinas de economia circular e educação climática', icon: 'Calendar', metadata: { destaque: false }, sortOrder: 1 },
        { key: 'evento-20-03', type: 'program_event', value: '20/03', title: 'Sexta-feira', subtitle: 'Escola Municipal Professor Lourenço Filho', description: 'Jornada de sensibilização sobre socialização climática', icon: 'Calendar', metadata: { destaque: false }, sortOrder: 2 },
        { key: 'evento-21-03', type: 'program_event', value: '21/03', title: 'Sábado', subtitle: 'Praça Edmundo Rego', description: 'Mutirão da Horta Comunitária / Caminhada Histórica e Ecológica', icon: 'Calendar', metadata: { destaque: false }, sortOrder: 3 },
        { key: 'evento-22-03', type: 'program_event', value: '22/03', title: 'Domingo', subtitle: 'Praça Edmundo Rego', description: 'Feira de Trocas / Feira de Usados e Brechós / Expositores / Shows e Apresentações Artísticas / Oficinas e Compartilhamento de Saberes / Danças Circulares / Praça de Alimentação sem carne / Estação de Reparos / Espaço Holístico / Cinema / Artivismo e muito mais!', icon: 'Calendar', metadata: { destaque: false }, sortOrder: 4 },
        { key: 'feira-de-trocas', type: 'thematic_space', title: 'Feira de Trocas', description: 'Participe da troca de produtos e serviço em um espaço com curadoria e moeda social onde a economia circular é colocada em prática', icon: 'Palette', color: 'bg-espacos-roxo-escuro', sortOrder: 10 },
        { key: 'brecho-economia-criativa', type: 'thematic_space', title: 'Feira de Brechó e Economia Criativa', description: 'Encontre diversos produtos sustentáveis como roupas, artesanatos, objetos de decoração, entre outros', icon: 'Users', color: 'bg-espacos-magenta', sortOrder: 11 },
        { key: 'escola-viva', type: 'thematic_space', title: 'Escola Viva', description: 'Participe de momentos de construção coletiva de saberes e troca livre de conhecimento', icon: 'Wrench', color: 'bg-espacos-verde-escuro', sortOrder: 12 },
        { key: 'espaco-multicultural', type: 'thematic_space', title: 'Espaço Multicultural', description: 'Assista e participe de apresentações artísticas em diversas linguagens como música, danças circulares, batalha de rima, baile charme, entre outras', icon: 'Heart', color: 'bg-espacos-roxo', sortOrder: 13 },
        { key: 'estacao-de-reparos', type: 'thematic_space', title: 'Estação de Reparos', description: 'Encontre profissionais para realizar pequenos reparos em bicicletas, roupas, sapatos e eletrônicos', icon: 'Utensils', color: 'bg-espacos-magenta', sortOrder: 14 },
        { key: 'praca-alimentacao', type: 'thematic_space', title: 'Praça de Alimentação', description: 'Deguste de opções gastronômicas incríveis em nossa praça de alimentação sem carne', icon: 'MapPin', color: 'bg-espacos-verde-escuro', sortOrder: 15 },
        { key: 'mutirao-horta-comunitaria', type: 'thematic_space', title: 'Mutirão da Horta Comunitária', description: 'Participe desse movimento coletivo de plantio, reconexão e educação ambiental do território', icon: 'Sprout', color: 'bg-espacos-roxo', sortOrder: 16 },
        { key: 'caminhada-historica-ecologica', type: 'thematic_space', title: 'Caminhada Histórica e Ecológica', description: 'Explore a história e ecologia do bairro em caminhadas guiadas', icon: 'Footprints', color: 'bg-espacos-magenta', sortOrder: 17 },
        { key: 'terapias-integrativas', type: 'thematic_space', title: 'Terapias Integrativas', description: 'Reiki, yoga, meditação, óleos e outras práticas de bem-estar', icon: 'Sparkles', color: 'bg-espacos-verde-escuro', sortOrder: 18 },
        { key: 'sympla-ingresso', type: 'cta_link', title: 'Retire seu ingresso', url: 'https://www.sympla.com.br/evento/festival-desapegue-se-124-edicao/3286556?algoliaID=911c8b4edb80ca5ae4f88b16dcf90bd2&share_id=copiarlink', sortOrder: 30 },
      ],
    },
```

- [ ] **Step 4: Run the default content test**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/default-landing-content.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit default content**

Run from API root:

```powershell
git add src/modules/landing/default-landing-content.ts src/modules/landing/default-landing-content.spec.ts
git commit -m "feat(cms): add default landing content"
```

Expected: commit succeeds.

---

## Task 3: API Landing Assets Utility

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing-assets.util.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing-assets.util.spec.ts`

- [ ] **Step 1: Write failing tests for Base64 helpers**

Create `src/modules/landing/landing-assets.util.spec.ts`:

```ts
import { normalizeBase64Image, resolveFrontendPublicAssetPath } from './landing-assets.util';

describe('landing asset utilities', () => {
  it('normalizes data URL images to raw Base64 and MIME type', () => {
    const result = normalizeBase64Image('data:image/png;base64,QUJD');

    expect(result.mimeType).toBe('image/png');
    expect(result.base64Data).toBe('QUJD');
  });

  it('keeps raw Base64 with the fallback MIME type', () => {
    const result = normalizeBase64Image('QUJD', 'image/jpeg');

    expect(result.mimeType).toBe('image/jpeg');
    expect(result.base64Data).toBe('QUJD');
  });

  it('resolves frontend public asset paths from the sibling landing repository', () => {
    const path = resolveFrontendPublicAssetPath('public/img/festival37.jpg');

    expect(path.endsWith('festival-desapegue-se-landingage\\public\\img\\festival37.jpg')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing-assets.util.spec.ts --runInBand
```

Expected: FAIL because `landing-assets.util.ts` does not exist.

- [ ] **Step 3: Implement asset helpers**

Create `src/modules/landing/landing-assets.util.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

export function normalizeBase64Image(
  value: string,
  fallbackMimeType = 'application/octet-stream',
): { mimeType: string; base64Data: string } {
  const trimmed = value.trim();
  const match = DATA_URL_PATTERN.exec(trimmed);

  if (match) {
    return {
      mimeType: match[1],
      base64Data: match[2],
    };
  }

  return {
    mimeType: fallbackMimeType,
    base64Data: trimmed,
  };
}

export function resolveFrontendPublicAssetPath(relativePath: string): string {
  return resolve(process.cwd(), '..', 'festival-desapegue-se-landingage', relativePath);
}

export function readFrontendAssetAsBase64(relativePath: string): string {
  return readFileSync(resolveFrontendPublicAssetPath(relativePath)).toString('base64');
}
```

- [ ] **Step 4: Run tests to verify pass**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing-assets.util.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit asset utility**

Run from API root:

```powershell
git add src/modules/landing/landing-assets.util.ts src/modules/landing/landing-assets.util.spec.ts
git commit -m "feat(cms): add landing asset helpers"
```

Expected: commit succeeds.

---

## Task 4: API Public Landing Service

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.types.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.service.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.service.spec.ts`

- [ ] **Step 1: Write failing service test for public payload**

Create `src/modules/landing/landing.service.spec.ts`:

```ts
import { NotFoundException } from '@nestjs/common';
import { LandingService } from './landing.service';

const now = new Date('2026-05-05T12:00:00.000Z');

function createPrismaMock() {
  return {
    landingPage: {
      findUnique: jest.fn(),
    },
  };
}

describe('LandingService', () => {
  it('returns active sections, items and assets ordered for the public landing', async () => {
    const prisma = createPrismaMock();
    prisma.landingPage.findUnique.mockResolvedValue({
      id: 'page-1',
      slug: 'default',
      locale: 'pt-BR',
      seoTitle: 'Festival Desapegue-se',
      seoDescription: 'Descrição',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      sections: [
        {
          id: 'section-2',
          key: 'second',
          type: 'text',
          title: 'Second',
          subtitle: null,
          description: null,
          metadata: null,
          sortOrder: 20,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          items: [],
          assets: [],
        },
        {
          id: 'section-1',
          key: 'hero',
          type: 'hero_carousel',
          title: 'Hero',
          subtitle: null,
          description: 'Hero description',
          metadata: { helperText: 'Clique para expandir' },
          sortOrder: 10,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          items: [
            {
              id: 'item-2',
              key: 'stat-2',
              type: 'stat',
              title: 'B',
              subtitle: null,
              description: null,
              value: '+2',
              icon: null,
              color: null,
              url: null,
              metadata: null,
              sortOrder: 2,
              isActive: true,
              createdAt: now,
              updatedAt: now,
              assets: [],
            },
            {
              id: 'item-1',
              key: 'stat-1',
              type: 'stat',
              title: 'A',
              subtitle: null,
              description: null,
              value: '+1',
              icon: null,
              color: null,
              url: null,
              metadata: null,
              sortOrder: 1,
              isActive: true,
              createdAt: now,
              updatedAt: now,
              assets: [],
            },
          ],
          assets: [
            {
              id: 'asset-1',
              key: 'logo',
              type: 'logo',
              theme: 'light',
              fileName: 'logo.png',
              mimeType: 'image/png',
              base64Data: 'QUJD',
              altText: 'Logo',
              sortOrder: 1,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            },
          ],
        },
      ],
      assets: [],
    });

    const service = new LandingService(prisma as never);
    const payload = await service.getDefaultPage();

    expect(payload.slug).toBe('default');
    expect(payload.sections.map(section => section.key)).toEqual(['hero', 'second']);
    expect(payload.sections[0].items.map(item => item.key)).toEqual(['stat-1', 'stat-2']);
    expect(payload.sections[0].assets[0].src).toBe('data:image/png;base64,QUJD');
  });

  it('throws NotFoundException when the default landing page does not exist', async () => {
    const prisma = createPrismaMock();
    prisma.landingPage.findUnique.mockResolvedValue(null);

    const service = new LandingService(prisma as never);

    await expect(service.getDefaultPage()).rejects.toBeInstanceOf(NotFoundException);
  });
});
```

- [ ] **Step 2: Run service test to verify failure**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing.service.spec.ts --runInBand
```

Expected: FAIL because `landing.service.ts` does not exist.

- [ ] **Step 3: Add public payload types**

Create `src/modules/landing/landing.types.ts`:

```ts
export type LandingAssetPayload = {
  id: string;
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  mimeType: string;
  src: string;
  altText: string;
  sortOrder: number;
};

export type LandingItemPayload = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  value: string | null;
  icon: string | null;
  color: string | null;
  url: string | null;
  metadata: unknown;
  sortOrder: number;
  assets: LandingAssetPayload[];
};

export type LandingSectionPayload = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: unknown;
  sortOrder: number;
  items: LandingItemPayload[];
  assets: LandingAssetPayload[];
};

export type LandingPagePayload = {
  id: string;
  slug: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  sections: LandingSectionPayload[];
  assets: LandingAssetPayload[];
};
```

- [ ] **Step 4: Implement public landing service**

Create `src/modules/landing/landing.service.ts` with public read and mapping helpers:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  LandingAssetPayload,
  LandingItemPayload,
  LandingPagePayload,
  LandingSectionPayload,
} from './landing.types';

@Injectable()
export class LandingService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultPage(): Promise<LandingPagePayload> {
    const page = await this.prisma.landingPage.findUnique({
      where: { slug: 'default' },
      include: {
        assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        sections: {
          where: { isActive: true },
          include: {
            assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
            items: {
              where: { isActive: true },
              include: {
                assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!page || !page.isActive) {
      throw new NotFoundException('Default landing page not found.');
    }

    return {
      id: page.id,
      slug: page.slug,
      locale: page.locale,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      assets: page.assets.map(asset => this.mapAsset(asset)),
      sections: page.sections.map(section => this.mapSection(section)),
    };
  }

  private mapSection(section: {
    id: string;
    key: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    metadata: unknown;
    sortOrder: number;
    items: Array<{
      id: string;
      key: string;
      type: string;
      title: string | null;
      subtitle: string | null;
      description: string | null;
      value: string | null;
      icon: string | null;
      color: string | null;
      url: string | null;
      metadata: unknown;
      sortOrder: number;
      assets: Array<Parameters<LandingService['mapAsset']>[0]>;
    }>;
    assets: Array<Parameters<LandingService['mapAsset']>[0]>;
  }): LandingSectionPayload {
    return {
      id: section.id,
      key: section.key,
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      metadata: section.metadata,
      sortOrder: section.sortOrder,
      items: section.items.map(item => this.mapItem(item)),
      assets: section.assets.map(asset => this.mapAsset(asset)),
    };
  }

  private mapItem(item: {
    id: string;
    key: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    value: string | null;
    icon: string | null;
    color: string | null;
    url: string | null;
    metadata: unknown;
    sortOrder: number;
    assets: Array<Parameters<LandingService['mapAsset']>[0]>;
  }): LandingItemPayload {
    return {
      id: item.id,
      key: item.key,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      value: item.value,
      icon: item.icon,
      color: item.color,
      url: item.url,
      metadata: item.metadata,
      sortOrder: item.sortOrder,
      assets: item.assets.map(asset => this.mapAsset(asset)),
    };
  }

  private mapAsset(asset: {
    id: string;
    key: string;
    type: string;
    theme: string | null;
    fileName: string;
    mimeType: string;
    base64Data: string;
    altText: string;
    sortOrder: number;
  }): LandingAssetPayload {
    return {
      id: asset.id,
      key: asset.key,
      type: asset.type,
      theme: asset.theme,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      src: `data:${asset.mimeType};base64,${asset.base64Data}`,
      altText: asset.altText,
      sortOrder: asset.sortOrder,
    };
  }
}
```

- [ ] **Step 5: Run landing service test**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing.service.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 6: Commit public landing service**

Run from API root:

```powershell
git add src/modules/landing/landing.types.ts src/modules/landing/landing.service.ts src/modules/landing/landing.service.spec.ts
git commit -m "feat(cms): expose public landing payload"
```

Expected: commit succeeds.

---

## Task 5: API Admin Landing Mutations

**Files:**
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.service.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.types.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\schemas\landing.schema.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\dto\update-landing-page.dto.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\dto\update-landing-section.dto.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\dto\create-landing-item.dto.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\dto\update-landing-item.dto.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\dto\upsert-landing-asset.dto.ts`

- [ ] **Step 1: Extend failing service tests for admin updates**

Append to `src/modules/landing/landing.service.spec.ts`:

```ts
  it('updates editable section fields and trims text', async () => {
    const prisma = {
      landingSection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'section-1' }),
        update: jest.fn().mockResolvedValue({
          id: 'section-1',
          key: 'hero',
          type: 'hero_carousel',
          title: 'Novo título',
          subtitle: null,
          description: 'Nova descrição',
          metadata: { helperText: 'Arraste' },
          sortOrder: 10,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          items: [],
          assets: [],
        }),
      },
    };

    const service = new LandingService(prisma as never);
    const result = await service.updateSection('section-1', {
      title: '  Novo título  ',
      description: '  Nova descrição  ',
      metadata: { helperText: 'Arraste' },
    });

    expect(prisma.landingSection.update).toHaveBeenCalledWith({
      where: { id: 'section-1' },
      data: {
        title: 'Novo título',
        description: 'Nova descrição',
        metadata: { helperText: 'Arraste' },
      },
      include: {
        assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        items: {
          where: { isActive: true },
          include: {
            assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    expect(result.title).toBe('Novo título');
  });

  it('normalizes asset Base64 when updating an image', async () => {
    const prisma = {
      landingAsset: {
        findUnique: jest.fn().mockResolvedValue({ id: 'asset-1' }),
        update: jest.fn().mockResolvedValue({
          id: 'asset-1',
          key: 'main_logo_light',
          type: 'logo',
          theme: 'light',
          fileName: 'logo.png',
          mimeType: 'image/png',
          base64Data: 'QUJD',
          altText: 'Logo claro',
          sortOrder: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }),
      },
    };

    const service = new LandingService(prisma as never);
    const result = await service.updateAsset('asset-1', {
      base64Data: 'data:image/png;base64,QUJD',
      altText: ' Logo claro ',
    });

    expect(prisma.landingAsset.update).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
      data: {
        base64Data: 'QUJD',
        mimeType: 'image/png',
        altText: 'Logo claro',
      },
    });
    expect(result.src).toBe('data:image/png;base64,QUJD');
  });
```

- [ ] **Step 2: Run tests to verify failure**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing.service.spec.ts --runInBand
```

Expected: FAIL because admin methods do not exist.

- [ ] **Step 3: Add Zod schemas**

Create `src/modules/landing/schemas/landing.schema.ts`:

```ts
import { z } from 'zod';

const metadataSchema = z.record(z.string(), z.unknown()).optional();

export const updateLandingPageSchema = z
  .strictObject({
    seoTitle: z.string().trim().min(1).max(180).optional(),
    seoDescription: z.string().trim().min(1).max(2000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

export const updateLandingSectionSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(240).nullable().optional(),
    subtitle: z.string().trim().min(1).max(320).nullable().optional(),
    description: z.string().trim().min(1).max(4000).nullable().optional(),
    metadata: metadataSchema,
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

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
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be informed.',
  });

export const upsertLandingAssetSchema = z.strictObject({
  landingPageId: z.string().uuid().optional(),
  sectionId: z.string().uuid().nullable().optional(),
  itemId: z.string().uuid().nullable().optional(),
  key: z.string().trim().min(1).max(120).optional(),
  type: z.string().trim().min(1).max(80).optional(),
  theme: z.enum(['light', 'dark']).nullable().optional(),
  fileName: z.string().trim().min(1).max(220).optional(),
  mimeType: z.string().trim().min(1).max(80).optional(),
  base64Data: z.string().trim().min(1).max(8_000_000).optional(),
  altText: z.string().trim().min(1).max(240).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
```

- [ ] **Step 4: Add DTO classes**

Create DTO files with class properties matching the schemas. Example for `dto/update-landing-section.dto.ts`:

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLandingSectionDto {
  @ApiPropertyOptional({ nullable: true })
  title?: string | null;

  @ApiPropertyOptional({ nullable: true })
  subtitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 10 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
```

Create `dto/update-landing-page.dto.ts`:

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLandingPageDto {
  @ApiPropertyOptional({ example: 'Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte' })
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Festival itinerante de sustentabilidade, economia circular, arte e conexão.' })
  seoDescription?: string;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
```

Create `dto/create-landing-item.dto.ts`:

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLandingItemDto {
  @ApiProperty({ example: 'novo-card' })
  key!: string;

  @ApiProperty({ example: 'pillar_card' })
  type!: string;

  @ApiPropertyOptional({ nullable: true })
  title?: string | null;

  @ApiPropertyOptional({ nullable: true })
  subtitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  value?: string | null;

  @ApiPropertyOptional({ nullable: true })
  icon?: string | null;

  @ApiPropertyOptional({ nullable: true })
  color?: string | null;

  @ApiPropertyOptional({ nullable: true })
  url?: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
```

Create `dto/update-landing-item.dto.ts`:

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLandingItemDto {
  @ApiPropertyOptional({ nullable: true })
  title?: string | null;

  @ApiPropertyOptional({ nullable: true })
  subtitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  value?: string | null;

  @ApiPropertyOptional({ nullable: true })
  icon?: string | null;

  @ApiPropertyOptional({ nullable: true })
  color?: string | null;

  @ApiPropertyOptional({ nullable: true })
  url?: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
```

Create `dto/upsert-landing-asset.dto.ts`:

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertLandingAssetDto {
  @ApiPropertyOptional()
  landingPageId?: string;

  @ApiPropertyOptional({ nullable: true })
  sectionId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  itemId?: string | null;

  @ApiPropertyOptional({ example: 'hero_carousel_15' })
  key?: string;

  @ApiPropertyOptional({ example: 'image' })
  type?: string;

  @ApiPropertyOptional({ nullable: true, enum: ['light', 'dark'] })
  theme?: 'light' | 'dark' | null;

  @ApiPropertyOptional({ example: 'festival.jpg' })
  fileName?: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  mimeType?: string;

  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...' })
  base64Data?: string;

  @ApiPropertyOptional({ example: 'Imagem do Festival Desapegue-se' })
  altText?: string;

  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
```

- [ ] **Step 5: Implement admin methods in service**

Add methods to `LandingService`:

```ts
import { normalizeBase64Image } from './landing-assets.util';

type UpdateSectionInput = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

function cleanNullableText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim();
}
```

Add these class methods:

```ts
async updateSection(id: string, input: UpdateSectionInput): Promise<LandingSectionPayload> {
  await this.ensureSectionExists(id);
  const section = await this.prisma.landingSection.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: cleanNullableText(input.title) } : {}),
      ...(input.subtitle !== undefined ? { subtitle: cleanNullableText(input.subtitle) } : {}),
      ...(input.description !== undefined ? { description: cleanNullableText(input.description) } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      items: {
        where: { isActive: true },
        include: {
          assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return this.mapSection(section);
}

async updateAsset(
  id: string,
  input: {
    base64Data?: string;
    mimeType?: string;
    altText?: string;
    fileName?: string;
    theme?: 'light' | 'dark' | null;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<LandingAssetPayload> {
  await this.ensureAssetExists(id);
  const normalized = input.base64Data
    ? normalizeBase64Image(input.base64Data, input.mimeType)
    : null;

  const asset = await this.prisma.landingAsset.update({
    where: { id },
    data: {
      ...(normalized ? { base64Data: normalized.base64Data, mimeType: normalized.mimeType } : {}),
      ...(input.altText !== undefined ? { altText: input.altText.trim() } : {}),
      ...(input.fileName !== undefined ? { fileName: input.fileName.trim() } : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return this.mapAsset(asset);
}
```

Before updating an asset that receives `sectionId`, `itemId` or `landingPageId`, verify ownership consistency:

```ts
private async validateAssetOwnership(input: {
  landingPageId?: string;
  sectionId?: string | null;
  itemId?: string | null;
}): Promise<void> {
  if (!input.landingPageId || (!input.sectionId && !input.itemId)) {
    return;
  }

  if (input.sectionId) {
    const section = await this.prisma.landingSection.findUnique({
      where: { id: input.sectionId },
      select: { landingPageId: true },
    });

    if (!section || section.landingPageId !== input.landingPageId) {
      throw new BadRequestException('Asset section must belong to the landing page.');
    }
  }

  if (input.itemId) {
    const item = await this.prisma.landingItem.findUnique({
      where: { id: input.itemId },
      select: { section: { select: { landingPageId: true } } },
    });

    if (!item || item.section.landingPageId !== input.landingPageId) {
      throw new BadRequestException('Asset item must belong to the landing page.');
    }
  }
}
```

Call `await this.validateAssetOwnership(input);` in asset create/update paths before writing relations. Import `BadRequestException` from `@nestjs/common`.

Add page and item mutation methods:

```ts
async updateDefaultPage(input: {
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
}): Promise<LandingPagePayload> {
  await this.prisma.landingPage.update({
    where: { slug: 'default' },
    data: {
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle.trim() } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription.trim() } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return this.getDefaultPage();
}

async createItem(sectionId: string, input: CreateLandingItemInput): Promise<LandingItemPayload> {
  await this.ensureSectionExists(sectionId);
  const item = await this.prisma.landingItem.create({
    data: {
      sectionId,
      key: input.key.trim(),
      type: input.type.trim(),
      title: cleanNullableText(input.title) ?? null,
      subtitle: cleanNullableText(input.subtitle) ?? null,
      description: cleanNullableText(input.description) ?? null,
      value: cleanNullableText(input.value) ?? null,
      icon: cleanNullableText(input.icon) ?? null,
      color: cleanNullableText(input.color) ?? null,
      url: cleanNullableText(input.url) ?? null,
      metadata: input.metadata,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });

  return this.mapItem(item);
}

async updateItem(id: string, input: UpdateLandingItemInput): Promise<LandingItemPayload> {
  await this.ensureItemExists(id);
  const item = await this.prisma.landingItem.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: cleanNullableText(input.title) } : {}),
      ...(input.subtitle !== undefined ? { subtitle: cleanNullableText(input.subtitle) } : {}),
      ...(input.description !== undefined ? { description: cleanNullableText(input.description) } : {}),
      ...(input.value !== undefined ? { value: cleanNullableText(input.value) } : {}),
      ...(input.icon !== undefined ? { icon: cleanNullableText(input.icon) } : {}),
      ...(input.color !== undefined ? { color: cleanNullableText(input.color) } : {}),
      ...(input.url !== undefined ? { url: cleanNullableText(input.url) } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      assets: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });

  return this.mapItem(item);
}

async removeItem(id: string): Promise<void> {
  await this.ensureItemExists(id);
  await this.prisma.landingItem.update({
    where: { id },
    data: { isActive: false },
  });
}
```

Define the input types near `UpdateSectionInput`:

```ts
type CreateLandingItemInput = {
  key: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  value?: string | null;
  icon?: string | null;
  color?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
};

type UpdateLandingItemInput = Omit<Partial<CreateLandingItemInput>, 'key' | 'type'>;
```

Also add `ensureSectionExists`, `ensureItemExists` and `ensureAssetExists` private methods that call `findUnique` and throw `NotFoundException` with clear messages.

- [ ] **Step 6: Run admin service tests**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing.service.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 7: Commit admin mutation service**

Run from API root:

```powershell
git add src/modules/landing
git commit -m "feat(cms): add admin landing mutations"
```

Expected: commit succeeds.

---

## Task 6: API Landing Controllers And Module Wiring

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.controller.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\admin-landing.controller.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing.module.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\app.module.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\test\app.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e tests for public and admin routes**

Append tests to `test/app.e2e-spec.ts` after existing health test. Override `LandingService` in the test module:

```ts
import { LandingService } from '../src/modules/landing/landing.service';
```

Inside `beforeAll`, define:

```ts
const landingServiceMock = {
  getDefaultPage: jest.fn().mockResolvedValue({
    id: 'page-1',
    slug: 'default',
    locale: 'pt-BR',
    seoTitle: 'Festival Desapegue-se',
    seoDescription: 'Descrição',
    sections: [],
    assets: [],
  }),
  updateSection: jest.fn().mockResolvedValue({
    id: 'section-1',
    key: 'hero',
    type: 'hero_carousel',
    title: 'Título editado',
    subtitle: null,
    description: null,
    metadata: null,
    sortOrder: 10,
    items: [],
    assets: [],
  }),
};
```

Then change module creation to:

```ts
const moduleFixture: TestingModule = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(LandingService)
  .useValue(landingServiceMock)
  .compile();
```

Add tests:

```ts
it('GET /api/v1/landing-pages/default returns public landing content', async () => {
  const server = app.getHttpServer() as Parameters<typeof request>[0];
  const response = await request(server).get('/api/v1/landing-pages/default').expect(200);

  expect(response.body.slug).toBe('default');
  expect(response.body.seoTitle).toContain('Festival Desapegue-se');
});

it('PATCH /api/v1/admin/landing-sections/:id rejects anonymous users', async () => {
  const server = app.getHttpServer() as Parameters<typeof request>[0];

  await request(server)
    .patch('/api/v1/admin/landing-sections/section-1')
    .send({ title: 'Título editado' })
    .expect(401);
});
```

- [ ] **Step 2: Run e2e tests to verify failure**

Run from API root:

```powershell
pnpm test:e2e -- --runInBand
```

Expected: FAIL because landing module and routes do not exist.

- [ ] **Step 3: Create public landing controller**

Create `src/modules/landing/landing.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { LandingService } from './landing.service';
import { LandingPagePayload } from './landing.types';

@ApiTags('Landing')
@Controller('landing-pages')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Public()
  @Get('default')
  @ApiOperation({ summary: 'Return the public Festival landing content.' })
  @ApiOkResponse({ description: 'Default landing content.' })
  async getDefault(): Promise<LandingPagePayload> {
    return this.landingService.getDefaultPage();
  }
}
```

- [ ] **Step 4: Create admin controller**

Create `src/modules/landing/admin-landing.controller.ts`:

```ts
import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod.validation.pipe';
import { UpdateLandingSectionDto } from './dto/update-landing-section.dto';
import { LandingSectionPayload } from './landing.types';
import { updateLandingSectionSchema } from './schemas/landing.schema';
import { LandingService } from './landing.service';

@ApiTags('Admin Landing')
@ApiBearerAuth('bearer')
@Roles('ADMIN')
@Controller('admin')
export class AdminLandingController {
  constructor(private readonly landingService: LandingService) {}

  @Patch('landing-sections/:id')
  @ApiOperation({ summary: 'Update a landing section.' })
  @ApiOkResponse({ description: 'Updated landing section.' })
  async updateSection(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLandingSectionSchema)) dto: UpdateLandingSectionDto,
  ): Promise<LandingSectionPayload> {
    return this.landingService.updateSection(id, dto);
  }
}
```

Extend `AdminLandingController` with the other protected endpoints:

```ts
  @Patch('landing-pages/default')
  @ApiOperation({ summary: 'Update default landing page metadata.' })
  async updatePage(
    @Body(new ZodValidationPipe(updateLandingPageSchema)) dto: UpdateLandingPageDto,
  ): Promise<LandingPagePayload> {
    return this.landingService.updateDefaultPage(dto);
  }

  @Post('landing-sections/:sectionId/items')
  @ApiOperation({ summary: 'Create a landing item inside a section.' })
  async createItem(
    @Param('sectionId') sectionId: string,
    @Body(new ZodValidationPipe(createLandingItemSchema)) dto: CreateLandingItemDto,
  ): Promise<LandingItemPayload> {
    return this.landingService.createItem(sectionId, dto);
  }

  @Patch('landing-items/:id')
  @ApiOperation({ summary: 'Update a landing item.' })
  async updateItem(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLandingItemSchema)) dto: UpdateLandingItemDto,
  ): Promise<LandingItemPayload> {
    return this.landingService.updateItem(id, dto);
  }

  @Delete('landing-items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a landing item.' })
  async removeItem(@Param('id') id: string): Promise<void> {
    return this.landingService.removeItem(id);
  }

  @Patch('landing-assets/:id')
  @ApiOperation({ summary: 'Update a landing asset.' })
  async updateAsset(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(upsertLandingAssetSchema)) dto: UpsertLandingAssetDto,
  ): Promise<LandingAssetPayload> {
    return this.landingService.updateAsset(id, dto);
  }
```

Add these imports to the controller:

```ts
import { Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateLandingItemDto } from './dto/create-landing-item.dto';
import { UpdateLandingItemDto } from './dto/update-landing-item.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';
import { UpsertLandingAssetDto } from './dto/upsert-landing-asset.dto';
import { LandingAssetPayload, LandingItemPayload, LandingPagePayload } from './landing.types';
import {
  createLandingItemSchema,
  updateLandingItemSchema,
  updateLandingPageSchema,
  upsertLandingAssetSchema,
} from './schemas/landing.schema';
```

- [ ] **Step 5: Create landing module and register it**

Create `src/modules/landing/landing.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AdminLandingController } from './admin-landing.controller';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';

@Module({
  controllers: [LandingController, AdminLandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
```

Modify `src/app.module.ts`:

```ts
import { LandingModule } from './modules/landing/landing.module';
```

Add `LandingModule` to `imports`.

- [ ] **Step 6: Run e2e tests**

Run from API root:

```powershell
pnpm test:e2e -- --runInBand
```

Expected: PASS for current e2e tests.

- [ ] **Step 7: Commit landing controllers**

Run from API root:

```powershell
git add src/modules/landing src/app.module.ts test/app.e2e-spec.ts
git commit -m "feat(cms): add landing API routes"
```

Expected: commit succeeds.

---

## Task 7: API Newsletter Module

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\newsletter.service.spec.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\newsletter.service.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\newsletter.controller.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\newsletter.module.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\schemas\newsletter.schema.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\dto\create-newsletter-subscription.dto.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\newsletter\entities\newsletter-subscription.entity.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\app.module.ts`

- [ ] **Step 1: Write failing newsletter service tests**

Create `src/modules/newsletter/newsletter.service.spec.ts`:

```ts
import { NewsletterService } from './newsletter.service';

const now = new Date('2026-05-05T12:00:00.000Z');

function createPrismaMock() {
  return {
    newsletterSubscription: {
      upsert: jest.fn(),
    },
  };
}

describe('NewsletterService', () => {
  it('normalizes email before persisting subscription', async () => {
    const prisma = createPrismaMock();
    prisma.newsletterSubscription.upsert.mockResolvedValue({
      id: 'sub-1',
      email: 'user@example.com',
      source: 'footer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const service = new NewsletterService(prisma as never);
    const result = await service.subscribe({ email: '  USER@Example.COM  ' });

    expect(prisma.newsletterSubscription.upsert).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      create: { email: 'user@example.com', source: 'footer', isActive: true },
      update: { source: 'footer', isActive: true },
    });
    expect(result.email).toBe('user@example.com');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run from API root:

```powershell
pnpm exec jest src/modules/newsletter/newsletter.service.spec.ts --runInBand
```

Expected: FAIL because newsletter service does not exist.

- [ ] **Step 3: Implement newsletter entity and service**

Create `src/modules/newsletter/entities/newsletter-subscription.entity.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';

type NewsletterSubscriptionRecord = {
  id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class NewsletterSubscriptionEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromRecord(record: NewsletterSubscriptionRecord): NewsletterSubscriptionEntity {
    return {
      id: record.id,
      email: record.email,
      source: record.source,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
```

Create `src/modules/newsletter/newsletter.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { NewsletterSubscriptionEntity } from './entities/newsletter-subscription.entity';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: CreateNewsletterSubscriptionDto): Promise<NewsletterSubscriptionEntity> {
    const email = dto.email.trim().toLowerCase();
    const source = dto.source?.trim() || 'footer';

    const subscription = await this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: { email, source, isActive: true },
      update: { source, isActive: true },
    });

    return NewsletterSubscriptionEntity.fromRecord(subscription);
  }
}
```

This lowercase normalization is required because PostgreSQL unique indexes on `VARCHAR` are case-sensitive. All newsletter writes must go through this service.

- [ ] **Step 4: Add schema, DTO, controller and module**

Create `src/modules/newsletter/schemas/newsletter.schema.ts`:

```ts
import { z } from 'zod';

export const createNewsletterSubscriptionSchema = z.strictObject({
  email: z.string().trim().email().max(180),
  source: z.string().trim().min(1).max(80).optional(),
});
```

Create `src/modules/newsletter/dto/create-newsletter-subscription.dto.ts`:

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsletterSubscriptionDto {
  @ApiProperty({ example: 'contato@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'footer' })
  source?: string;
}
```

Create `src/modules/newsletter/newsletter.controller.ts`:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod.validation.pipe';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { NewsletterSubscriptionEntity } from './entities/newsletter-subscription.entity';
import { createNewsletterSubscriptionSchema } from './schemas/newsletter.schema';
import { NewsletterService } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter/subscriptions')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Subscribe an email to the Festival newsletter.' })
  @ApiCreatedResponse({ type: NewsletterSubscriptionEntity })
  async subscribe(
    @Body(new ZodValidationPipe(createNewsletterSubscriptionSchema))
    dto: CreateNewsletterSubscriptionDto,
  ): Promise<NewsletterSubscriptionEntity> {
    return this.newsletterService.subscribe(dto);
  }
}
```

Create `src/modules/newsletter/newsletter.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
```

Register `NewsletterModule` in `src/app.module.ts`.

- [ ] **Step 5: Run newsletter test**

Run from API root:

```powershell
pnpm exec jest src/modules/newsletter/newsletter.service.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 6: Commit newsletter module**

Run from API root:

```powershell
git add src/modules/newsletter src/app.module.ts
git commit -m "feat(newsletter): add subscription endpoint"
```

Expected: commit succeeds.

---

## Task 8: API Seed Default Landing

**Files:**
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\prisma\seed.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-api\src\modules\landing\landing-seed.spec.ts`

- [ ] **Step 1: Write failing seed mapping test**

Create `src/modules/landing/landing-seed.spec.ts`:

```ts
import { DEFAULT_LANDING_CONTENT } from './default-landing-content';

describe('landing seed contract', () => {
  it('uses unique section keys and item keys within each section', () => {
    const sectionKeys = DEFAULT_LANDING_CONTENT.sections.map(section => section.key);
    expect(new Set(sectionKeys).size).toBe(sectionKeys.length);

    for (const section of DEFAULT_LANDING_CONTENT.sections) {
      const itemKeys = section.items.map(item => item.key);
      const assetKeys = section.assets.map(asset => asset.key);

      expect(new Set(itemKeys).size).toBe(itemKeys.length);
      expect(new Set(assetKeys).size).toBe(assetKeys.length);
    }
  });

  it('contains source paths for every default asset', () => {
    const assets = DEFAULT_LANDING_CONTENT.sections.flatMap(section => section.assets);

    expect(assets.length).toBeGreaterThan(20);
    for (const asset of assets) {
      expect(asset.sourcePath.startsWith('public/img/')).toBe(true);
      expect(asset.mimeType.startsWith('image/')).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run seed contract test**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/landing-seed.spec.ts --runInBand
```

Expected: PASS if Task 2 content is complete; otherwise fill missing current landing assets and rerun.

- [ ] **Step 3: Update seed user credentials**

In `prisma/seed.ts`, replace the current admin seed with:

```ts
async function seedUsers(): Promise<void> {
  await prisma.user.upsert({
    where: { email: 'admin@festivaldesapeguese.com.br' },
    update: {
      name: 'Administrador Festival Desapegue-se',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@festivaldesapeguese.com.br',
      name: 'Administrador Festival Desapegue-se',
      passwordHash: await hashPassword('Admin@2611'),
      role: 'ADMIN',
      isActive: true,
    },
  });
}
```

- [ ] **Step 4: Add landing seed functions**

In `prisma/seed.ts`, import defaults and asset helper:

```ts
import { DEFAULT_LANDING_CONTENT } from '../src/modules/landing/default-landing-content';
import { readFrontendAssetAsBase64 } from '../src/modules/landing/landing-assets.util';
```

Add:

```ts
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
      where: {
        landingPageId_key: {
          landingPageId: page.id,
          key: sectionInput.key,
        },
      },
      update: {
        type: sectionInput.type,
        title: sectionInput.title ?? null,
        subtitle: sectionInput.subtitle ?? null,
        description: sectionInput.description ?? null,
        metadata: sectionInput.metadata,
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
        metadata: sectionInput.metadata,
        sortOrder: sectionInput.sortOrder,
        isActive: true,
      },
    });

    for (const itemInput of sectionInput.items) {
      await prisma.landingItem.upsert({
        where: {
          sectionId_key: {
            sectionId: section.id,
            key: itemInput.key,
          },
        },
        update: {
          type: itemInput.type,
          title: itemInput.title ?? null,
          subtitle: itemInput.subtitle ?? null,
          description: itemInput.description ?? null,
          value: itemInput.value ?? null,
          icon: itemInput.icon ?? null,
          color: itemInput.color ?? null,
          url: itemInput.url ?? null,
          metadata: itemInput.metadata,
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
          metadata: itemInput.metadata,
          sortOrder: itemInput.sortOrder,
          isActive: true,
        },
      });
    }

    for (const assetInput of sectionInput.assets) {
      await prisma.landingAsset.upsert({
        where: {
          landingPageId_key: {
            landingPageId: page.id,
            key: assetInput.key,
          },
        },
        update: {
          sectionId: section.id,
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
```

Call `await seedLandingPage();` inside `main()` after `await seedUsers();`.

- [ ] **Step 5: Run unit tests**

Run from API root:

```powershell
pnpm exec jest src/modules/landing/default-landing-content.spec.ts src/modules/landing/landing-seed.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 6: Run Prisma generate**

Run from API root:

```powershell
pnpm prisma:generate
```

Expected: Prisma client generation succeeds.

- [ ] **Step 7: Commit seed work**

Run from API root:

```powershell
git add prisma/seed.ts src/modules/landing/landing-seed.spec.ts
git commit -m "feat(cms): seed default landing content"
```

Expected: commit succeeds.

---

## Task 9: Frontend Test Setup And API Client

**Files:**
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\package.json`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\vitest.config.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\test\setup.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\.env.example`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\landing\types.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\api\festival-api.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\api\festival-api.test.ts`

- [ ] **Step 1: Add frontend test dependencies**

Run from frontend root:

```powershell
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Expected: packages added to `package.json` and `pnpm-lock.yaml`.

- [ ] **Step 2: Add test scripts**

In `package.json`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create Vitest config and setup**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Write failing API client tests**

Create `src/lib/api/festival-api.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { FestivalApiError, createFestivalApiClient } from "./festival-api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("festival API client", () => {
  it("fetches default landing content from the configured API base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ slug: "default", sections: [], assets: [] }),
    });

    const client = createFestivalApiClient({
      baseUrl: "http://localhost:3333/api/v1",
      fetcher: fetchMock as never,
    });

    const payload = await client.getDefaultLandingPage();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3333/api/v1/landing-pages/default", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    expect(payload.slug).toBe("default");
  });

  it("sends bearer token for admin updates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "section-1", title: "Novo título" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "http://localhost:3333/api/v1",
      fetcher: fetchMock as never,
    });

    await client.updateSection("section-1", { title: "Novo título" }, "token-123");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3333/api/v1/admin/landing-sections/section-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({ title: "Novo título" }),
    });
  });

  it("throws FestivalApiError for non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid email" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "http://localhost:3333/api/v1",
      fetcher: fetchMock as never,
    });

    await expect(client.subscribeNewsletter("invalid")).rejects.toBeInstanceOf(FestivalApiError);
  });
});
```

- [ ] **Step 5: Run client tests to verify failure**

Run from frontend root:

```powershell
pnpm test src/lib/api/festival-api.test.ts
```

Expected: FAIL because `festival-api.ts` does not exist.

- [ ] **Step 6: Add frontend landing types**

Create `src/lib/landing/types.ts`:

```ts
export type LandingAsset = {
  id: string;
  key: string;
  type: string;
  theme: string | null;
  fileName: string;
  mimeType: string;
  src: string;
  altText: string;
  sortOrder: number;
};

export type LandingItem = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  value: string | null;
  icon: string | null;
  color: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  assets: LandingAsset[];
};

export type LandingSection = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  items: LandingItem[];
  assets: LandingAsset[];
};

export type LandingPageContent = {
  id: string;
  slug: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  sections: LandingSection[];
  assets: LandingAsset[];
};
```

- [ ] **Step 7: Implement API client**

Create `src/lib/api/festival-api.ts`:

```ts
import type { LandingPageContent } from "@/lib/landing/types";

type Fetcher = typeof fetch;

export class FestivalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown
  ) {
    super(message);
    this.name = "FestivalApiError";
  }
}

export type FestivalApiClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : "Erro ao comunicar com a API.";
    throw new FestivalApiError(message, response.status, payload);
  }

  return payload as T;
}

export function createFestivalApiClient(options: FestivalApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FESTIVAL_API_URL ?? "http://localhost:3333/api/v1").replace(
    /\/$/,
    ""
  );
  const fetcher = options.fetcher ?? fetch;

  return {
    async getDefaultLandingPage(): Promise<LandingPageContent> {
      const response = await fetcher(`${baseUrl}/landing-pages/default`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      return parseResponse<LandingPageContent>(response);
    },

    async login(email: string, password: string) {
      const response = await fetcher(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return parseResponse<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; name: string; email: string; role: "ADMIN" | "MEMBER" };
      }>(response);
    },

    async updateSection(id: string, payload: Record<string, unknown>, accessToken: string) {
      const response = await fetcher(`${baseUrl}/admin/landing-sections/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      return parseResponse(response);
    },

    async subscribeNewsletter(email: string) {
      const response = await fetcher(`${baseUrl}/newsletter/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      return parseResponse(response);
    },
  };
}

export const festivalApi = createFestivalApiClient();
```

- [ ] **Step 8: Update frontend env example**

Append to `.env.example`:

```dotenv
NEXT_PUBLIC_FESTIVAL_API_URL=http://localhost:3333/api/v1
```

- [ ] **Step 9: Run frontend client tests**

Run from frontend root:

```powershell
pnpm test src/lib/api/festival-api.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit frontend API client**

Run from frontend root:

```powershell
git add package.json pnpm-lock.yaml vitest.config.ts src/test src/lib/api src/lib/landing .env.example
git commit -m "feat(cms): add festival API client"
```

Expected: commit succeeds.

---

## Task 10: Frontend Admin Session And Login

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\admin\admin-session.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\admin\admin-session.test.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\context\AdminModeContext.tsx`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\app\[locale]\admin\login\page.tsx`

- [ ] **Step 1: Write failing admin session tests**

Create `src/lib/admin/admin-session.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { clearAdminSession, getAdminSession, saveAdminSession } from "./admin-session";

describe("admin session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and reads only ADMIN sessions", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: { id: "1", name: "Admin", email: "admin@example.com", role: "ADMIN" },
    });

    expect(getAdminSession()?.accessToken).toBe("token");
  });

  it("does not persist MEMBER sessions as admin mode", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: { id: "1", name: "Member", email: "member@example.com", role: "MEMBER" },
    });

    expect(getAdminSession()).toBeNull();
  });

  it("clears admin session", () => {
    saveAdminSession({
      accessToken: "token",
      refreshToken: "refresh",
      user: { id: "1", name: "Admin", email: "admin@example.com", role: "ADMIN" },
    });

    clearAdminSession();

    expect(getAdminSession()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run from frontend root:

```powershell
pnpm test src/lib/admin/admin-session.test.ts
```

Expected: FAIL because `admin-session.ts` does not exist.

- [ ] **Step 3: Implement admin session helper**

Create `src/lib/admin/admin-session.ts`:

```ts
const ADMIN_SESSION_KEY = "festival-desapegue-se-admin-session";

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  };
};

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;

  if (session.user.role !== "ADMIN") {
    clearAdminSession();
    return;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    return parsed.user.role === "ADMIN" ? parsed : null;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
```

- [ ] **Step 4: Run admin session tests**

Run from frontend root:

```powershell
pnpm test src/lib/admin/admin-session.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create admin context**

Create `src/context/AdminModeContext.tsx`:

```tsx
"use client";

import React from "react";
import { clearAdminSession, getAdminSession, type AdminSession } from "@/lib/admin/admin-session";

type AdminModeContextValue = {
  session: AdminSession | null;
  isAdmin: boolean;
  accessToken: string | null;
  refreshSession: () => void;
  logout: () => void;
};

const AdminModeContext = React.createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AdminSession | null>(null);

  const refreshSession = React.useCallback(() => {
    setSession(getAdminSession());
  }, []);

  const logout = React.useCallback(() => {
    clearAdminSession();
    setSession(null);
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <AdminModeContext.Provider
      value={{
        session,
        isAdmin: session?.user.role === "ADMIN",
        accessToken: session?.accessToken ?? null,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = React.useContext(AdminModeContext);
  if (!context) {
    throw new Error("useAdminMode must be used inside AdminModeProvider.");
  }
  return context;
}
```

- [ ] **Step 6: Wrap landing layout with AdminModeProvider**

In `src/app/[locale]/(landing-page)/layout.tsx`, import and wrap inside existing providers:

```tsx
import { AdminModeProvider } from "@/context/AdminModeContext";
```

Wrap around header/main/footer:

```tsx
<AdminModeProvider>
  <LandingHeader />
  <main id="main-content">
    {children}
    <CookieBanner />
  </main>
  <Footer />
</AdminModeProvider>
```

- [ ] **Step 7: Create admin login page**

Create `src/app/[locale]/admin/login/page.tsx` as a client component with email/password, `festivalApi.login`, `saveAdminSession`, `toast` and redirect to `/${locale}`. Use this structure:

```tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { festivalApi } from "@/lib/api/festival-api";
import { saveAdminSession } from "@/lib/admin/admin-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const session = await festivalApi.login(email, password);
      saveAdminSession(session);

      if (session.user.role !== "ADMIN") {
        toast.error("Este usuário não tem permissão de administrador.");
        return;
      }

      toast.success("Modo administrador ativado.");
      router.push(`/${params.locale}`);
    } catch {
      toast.error("Não foi possível entrar. Confira e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-20 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card rounded-2xl p-6 shadow-elevated flex flex-col gap-5">
        <div>
          <h1 className="heading-03-bold text-foreground">Admin Festival</h1>
          <p className="body-callout text-muted-foreground mt-2">Entre para editar o conteúdo da landing.</p>
        </div>
        <label className="flex flex-col gap-2 body-callout-medium text-foreground">
          E-mail
          <input className="bg-background rounded-xl border px-4 py-3 body-paragraph" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-2 body-callout-medium text-foreground">
          Senha
          <input className="bg-background rounded-xl border px-4 py-3 body-paragraph" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
        </label>
        <Button type="submit" loading={loading} loadingText="Entrando...">
          Entrar
        </Button>
      </form>
    </main>
  );
}
```

- [ ] **Step 8: Build frontend**

Run from frontend root:

```powershell
pnpm build
```

Expected: build succeeds or reports only issues introduced by older project configuration. Fix any new TypeScript errors from this task.

- [ ] **Step 9: Commit admin login**

Run from frontend root:

```powershell
git add src/lib/admin src/context/AdminModeContext.tsx src/app/[locale]/admin/login/page.tsx src/app/[locale]/\(landing-page\)/layout.tsx
git commit -m "feat(admin): add landing login session"
```

Expected: commit succeeds.

---

## Task 11: Frontend Dynamic Landing Content

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\landing\default-content.ts`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\app\[locale]\(landing-page)\(root)\_components\PageContainer.tsx`
- Modify: all files in `src\app\[locale]\(landing-page)\(root)\_components` that currently define local arrays.

- [ ] **Step 1: Create local fallback content**

Create `src/lib/landing/default-content.ts` with a `DEFAULT_LANDING_PAGE_CONTENT` object matching `LandingPageContent`. Reuse current public paths for images as `src` values. Use stable ids like `fallback-hero`, `fallback-stat-edicoes`.

- [ ] **Step 2: Refactor PageContainer to fetch content**

Convert `PageContainer` to an async server component:

```tsx
import { festivalApi } from "@/lib/api/festival-api";
import { DEFAULT_LANDING_PAGE_CONTENT } from "@/lib/landing/default-content";
import type { LandingPageContent } from "@/lib/landing/types";
```

Use:

```tsx
async function getLandingContent(): Promise<LandingPageContent> {
  try {
    return await festivalApi.getDefaultLandingPage();
  } catch {
    return DEFAULT_LANDING_PAGE_CONTENT;
  }
}

export const PageContainer = async () => {
  const content = await getLandingContent();
  const sectionByKey = new Map(content.sections.map(section => [section.key, section]));

  return (
    <div className="flex flex-col w-full">
      <MainBanner section={sectionByKey.get("hero")} />
      <DesapegarParaRegenerar section={sectionByKey.get("regenerar")} />
      <NossosCompromissos section={sectionByKey.get("compromissos")} />
      <NossaMissao section={sectionByKey.get("missao")} />
      <NossaTragetoria section={sectionByKey.get("trajetoria")} />
      <ReconhecimentoLegal section={sectionByKey.get("reconhecimento")} />
      <JusticaClimatica section={sectionByKey.get("programacao")} />
    </div>
  );
};
```

- [ ] **Step 3: Refactor MainBanner**

Change `MainBanner` signature:

```tsx
import type { LandingSection } from "@/lib/landing/types";

export const MainBanner = ({ section }: { section?: LandingSection }) => {
```

Derive values:

```tsx
const heroImages = section?.assets.filter(asset => asset.type === "image") ?? [];
const logoLight = section?.assets.find(asset => asset.key === "main_logo_light");
const logoDark = section?.assets.find(asset => asset.key === "main_logo_dark");
const logoSrc = resolvedTheme === "dark" ? logoDark?.src : logoLight?.src;
const images = heroImages.length > 0 ? heroImages : DEFAULT_LANDING_PAGE_CONTENT.sections.find(s => s.key === "hero")!.assets.filter(asset => asset.type === "image");
```

Replace hardcoded title and description with `section?.title` and `section?.description`.

- [ ] **Step 4: Refactor card and statistics components**

Pass `section` into `DesapegarParaRegenerar`, `PillaresCards` and `StatisticsCard`. Split items by `type`:

```tsx
const pillarCards = section?.items.filter(item => item.type === "pillar_card") ?? [];
const stats = section?.items.filter(item => item.type === "stat") ?? [];
```

Use `item.icon`, `item.color`, `item.title`, `item.description`, `item.value`.

- [ ] **Step 5: Refactor institutional and schedule sections**

Apply this prop-driven pattern:

```tsx
const commitmentCards = section?.items.filter(item => item.type === "commitment_card") ?? [];
const odsItems = section?.items.filter(item => item.type === "ods_logo") ?? [];
const timelineItems = section?.items.filter(item => item.type === "timeline_event") ?? [];
const programEvents = section?.items.filter(item => item.type === "program_event") ?? [];
const thematicSpaces = section?.items.filter(item => item.type === "thematic_space") ?? [];
const ctaLink = section?.items.find(item => item.type === "cta_link");
const backgrounds = section?.assets.filter(asset => asset.type === "background") ?? [];
```

Use the derived collections in:

- `NossosCompromissos`: section title/description and `commitmentCards`.
- `NossaMissao`: section title/description, `odsItems` and `backgrounds`.
- `TrajetoriaTimeline`: `timelineItems`.
- `ReconhecimentoLegal`: section title/subtitle/description and `backgrounds`.
- `JusticaClimatica`: section title/description, `programEvents`, `thematicSpaces` and `ctaLink`.

- [ ] **Step 6: Run frontend build**

Run from frontend root:

```powershell
pnpm build
```

Expected: build succeeds and the public landing still renders with fallback content when API is down.

- [ ] **Step 7: Commit dynamic rendering**

Run from frontend root:

```powershell
git add src/lib/landing src/app/[locale]/\(landing-page\)/\(root\)/_components
git commit -m "feat(cms): render landing from API content"
```

Expected: commit succeeds.

---

## Task 12: Frontend Inline Editing Primitives

**Files:**
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\admin\file-to-base64.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\admin\file-to-base64.test.ts`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\components\admin\EditableText.tsx`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\components\admin\EditableImage.tsx`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\components\admin\EditableCardToolbar.tsx`
- Create: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\components\admin\AdminFloatingBar.tsx`

- [ ] **Step 1: Write failing Base64 helper test**

Create `src/lib/admin/file-to-base64.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fileToBase64Payload } from "./file-to-base64";

describe("fileToBase64Payload", () => {
  it("converts a File into an API asset payload", async () => {
    const file = new File(["abc"], "logo.png", { type: "image/png" });

    const result = await fileToBase64Payload(file);

    expect(result.fileName).toBe("logo.png");
    expect(result.mimeType).toBe("image/png");
    expect(result.base64Data).toContain("base64,");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run from frontend root:

```powershell
pnpm test src/lib/admin/file-to-base64.test.ts
```

Expected: FAIL because `file-to-base64.ts` does not exist.

- [ ] **Step 3: Implement file conversion helper**

Create `src/lib/admin/file-to-base64.ts`:

```ts
export type Base64AssetPayload = {
  fileName: string;
  mimeType: string;
  base64Data: string;
};

export function fileToBase64Payload(file: File): Promise<Base64AssetPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        base64Data: String(reader.result),
      });
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler o arquivo."));
    };

    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 4: Run helper test**

Run from frontend root:

```powershell
pnpm test src/lib/admin/file-to-base64.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `EditableText`**

Create `src/components/admin/EditableText.tsx`:

```tsx
"use client";

import React from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminMode } from "@/context/AdminModeContext";

type EditableTextProps = {
  value: string;
  className?: string;
  multiline?: boolean;
  onSave: (value: string, accessToken: string) => Promise<void>;
  children: (value: string) => React.ReactNode;
};

export function EditableText({ value, className, multiline = false, onSave, children }: EditableTextProps) {
  const { isAdmin, accessToken } = useAdminMode();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  async function save() {
    if (!accessToken) return;
    setSaving(true);
    try {
      await onSave(draft, accessToken);
      setEditing(false);
      toast.success("Conteúdo atualizado.");
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return <>{children(value)}</>;
  }

  if (editing) {
    const fieldClassName = "w-full rounded-xl border border-primary bg-background px-3 py-2 text-foreground";
    return (
      <span className={cn("inline-flex w-full flex-col gap-2", className)}>
        {multiline ? (
          <textarea className={fieldClassName} value={draft} onChange={event => setDraft(event.target.value)} rows={4} />
        ) : (
          <input className={fieldClassName} value={draft} onChange={event => setDraft(event.target.value)} />
        )}
        <span className="inline-flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary p-2 text-background" aria-label="Salvar">
            <Check className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-muted p-2 text-foreground" aria-label="Cancelar">
            <X className="h-4 w-4" />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className={cn("group relative inline-flex items-center gap-2 outline outline-1 outline-dashed outline-primary/40", className)}>
      {children(value)}
      <button type="button" onClick={() => setEditing(true)} className="rounded-full bg-primary p-1 text-background opacity-0 transition-opacity group-hover:opacity-100" aria-label="Editar texto">
        <Pencil className="h-3 w-3" />
      </button>
    </span>
  );
}
```

- [ ] **Step 6: Create image and toolbar components**

Create `EditableImage.tsx` with a hidden file input, `fileToBase64Payload`, `onSave(payload, accessToken)`, and a small `Pencil` icon button overlay shown only for admins.

Create `EditableCardToolbar.tsx` with `ArrowUp`, `ArrowDown`, `Trash2` buttons and props:

```ts
type EditableCardToolbarProps = {
  onMoveUp?: () => Promise<void>;
  onMoveDown?: () => Promise<void>;
  onRemove?: () => Promise<void>;
};
```

Create `AdminFloatingBar.tsx` showing admin email and a logout button using `useAdminMode()`.

- [ ] **Step 7: Commit editing primitives**

Run from frontend root:

```powershell
git add src/lib/admin/file-to-base64.ts src/lib/admin/file-to-base64.test.ts src/components/admin
git commit -m "feat(admin): add inline editing primitives"
```

Expected: commit succeeds.

---

## Task 13: Frontend Wire Inline Editing Into Landing

**Files:**
- Modify: landing components under `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\app\[locale]\(landing-page)\(root)\_components`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\api\festival-api.ts`

- [ ] **Step 1: Extend API client with item and asset updates**

Add methods to `festival-api.ts`:

```ts
async updateItem(id: string, payload: Record<string, unknown>, accessToken: string) {
  const response = await fetcher(`${baseUrl}/admin/landing-items/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
},

async updateAsset(id: string, payload: Record<string, unknown>, accessToken: string) {
  const response = await fetcher(`${baseUrl}/admin/landing-assets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
},
```

Add tests for both methods to `festival-api.test.ts`, run `pnpm test src/lib/api/festival-api.test.ts`, verify failing first, then passing.

- [ ] **Step 2: Add section title editing**

In each section component, wrap title and description with `EditableText`. Example:

```tsx
<EditableText
  value={section?.title ?? "Desapegar para Regenerar"}
  onSave={(value, token) => festivalApi.updateSection(section!.id, { title: value }, token).then(() => router.refresh())}
>
  {text => <span className="text-4xl lg:text-5xl xl:display-02 2xl:display-02 font-display-hero font-bold text-foreground">{text}</span>}
</EditableText>
```

Use `useRouter` from `next/navigation` inside client components. Components that use hooks must keep or add `"use client"`.

- [ ] **Step 3: Add card text editing**

For card/item components, wrap `item.title`, `item.description`, `item.value` with `EditableText` and call `festivalApi.updateItem(item.id, { title: value }, token)`.

- [ ] **Step 4: Add logo and image editing**

In `MainBanner`, wrap the logo `Image` and each carousel `Image` with `EditableImage`. Save payload:

```ts
festivalApi.updateAsset(asset.id, {
  fileName: payload.fileName,
  mimeType: payload.mimeType,
  base64Data: payload.base64Data,
}, token)
```

Call `router.refresh()` after successful save.

- [ ] **Step 5: Add ordering controls for cards**

Use `EditableCardToolbar` around cards. For move up/down, swap `sortOrder` with the adjacent visible item by sending two `festivalApi.updateItem` calls. Use current array order as the source of truth.

- [ ] **Step 6: Add admin floating bar**

Render `<AdminFloatingBar />` once in `PageContainer` above `MainBanner`.

- [ ] **Step 7: Run frontend tests and build**

Run from frontend root:

```powershell
pnpm test
pnpm build
```

Expected: tests pass and build succeeds.

- [ ] **Step 8: Commit inline editing integration**

Run from frontend root:

```powershell
git add src/lib/api/festival-api.ts src/lib/api/festival-api.test.ts src/app/[locale]/\(landing-page\)/\(root\)/_components
git commit -m "feat(admin): wire inline landing editing"
```

Expected: commit succeeds.

---

## Task 14: Frontend Newsletter Integration

**Files:**
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\components\footer\footer.tsx`
- Modify: `D:\DEVJUANMARCOS\PROJETOS\BIOMOB\FESTIVAL DESAPEGUE-SE\festival-desapegue-se-landingage\src\lib\api\festival-api.test.ts`

- [ ] **Step 1: Confirm newsletter API client test covers the request**

Run from frontend root:

```powershell
pnpm test src/lib/api/festival-api.test.ts
```

Expected: PASS, including `subscribeNewsletter`.

- [ ] **Step 2: Integrate footer newsletter form**

In `src/components/footer/footer.tsx`, replace the console-only submit with:

```tsx
async function handleNewsletterSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    await festivalApi.subscribeNewsletter(email);
    toast.success("Inscrição realizada com sucesso.");
    setEmail("");
  } catch {
    toast.error("Não foi possível assinar a newsletter.");
  } finally {
    setLoading(false);
  }
}
```

Add:

```tsx
import { toast } from "sonner";
import { festivalApi } from "@/lib/api/festival-api";
```

Add `const [loading, setLoading] = useState(false);` and pass `loading={loading}` to the submit `Button`.

- [ ] **Step 3: Run frontend build**

Run from frontend root:

```powershell
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit newsletter integration**

Run from frontend root:

```powershell
git add src/components/footer/footer.tsx
git commit -m "feat(newsletter): connect footer signup"
```

Expected: commit succeeds.

---

## Task 15: End-To-End Local Verification

**Files:**
- No code files should change in this task unless verification exposes defects.

- [ ] **Step 1: Start local database**

Run from API root:

```powershell
pnpm db:up
```

Expected: Docker starts `festival-desapegue-se-local-postgres`.

- [ ] **Step 2: Apply migrations and seed**

Run from API root:

```powershell
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
```

Expected: migrations apply, admin user is created, default landing page is seeded.

- [ ] **Step 3: Run API verification**

Run from API root:

```powershell
pnpm test -- --runInBand
pnpm test:e2e -- --runInBand
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 4: Run frontend verification**

Run from frontend root:

```powershell
pnpm test
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 5: Start API and frontend for manual verification**

Run API from API root:

```powershell
pnpm start:dev
```

Run frontend from frontend root in another terminal:

```powershell
pnpm dev
```

Expected URLs:

- API Swagger: `http://localhost:3333/docs/swagger`
- Landing: `http://localhost:3000/pt`
- Admin login: `http://localhost:3000/pt/admin/login`

- [ ] **Step 6: Verify user-facing flows**

Manual checks:

1. Open `http://localhost:3000/pt`.
2. Confirm the landing visually matches the current content.
3. Submit newsletter with a test email and confirm success toast.
4. Open `http://localhost:3000/pt/admin/login`.
5. Login with `admin@festivaldesapeguese.com.br` / `Admin@2611`.
6. Edit the hero title and save.
7. Refresh public page and confirm edited title appears.
8. Replace one carousel image and confirm it still renders.

- [ ] **Step 7: Commit any verification fixes**

If fixes were required, commit them from the relevant repository with a scoped message such as:

```powershell
git add <changed-files>
git commit -m "fix(cms): stabilize landing content editing"
```

Expected: no commit is needed if verification passes without fixes.

---

## Self-Review Checklist

- Spec coverage: API content model, seed, Base64 assets, admin login, inline editing, newsletter, tests and local database are covered by Tasks 1-15.
- Red-flag scan: Plan avoids deferred work notes and gives exact paths, commands and expected outcomes.
- Type consistency: API uses `LandingPagePayload`, `LandingSectionPayload`, `LandingItemPayload`, `LandingAssetPayload`; frontend mirrors these as `LandingPageContent`, `LandingSection`, `LandingItem`, `LandingAsset`.
- TDD: Behavioral work starts with failing tests before service/client/helper implementation.
- Verification: Final task requires API tests, API e2e, API build, frontend tests, frontend build and manual flow checks.
