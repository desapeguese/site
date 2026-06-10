-- CreateTable
CREATE TABLE "landing_pages" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "locale" VARCHAR(16) NOT NULL DEFAULT 'pt-BR',
    "seo_title" VARCHAR(180) NOT NULL,
    "seo_description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_sections" (
    "id" TEXT NOT NULL,
    "landing_page_id" TEXT NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "title" VARCHAR(240),
    "subtitle" VARCHAR(320),
    "description" TEXT,
    "metadata" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_items" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "title" VARCHAR(240),
    "subtitle" VARCHAR(320),
    "description" TEXT,
    "value" VARCHAR(80),
    "icon" VARCHAR(80),
    "color" VARCHAR(80),
    "url" TEXT,
    "metadata" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_assets" (
    "id" TEXT NOT NULL,
    "landing_page_id" TEXT NOT NULL,
    "section_id" TEXT,
    "item_id" TEXT,
    "key" VARCHAR(120) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "theme" VARCHAR(20),
    "file_name" VARCHAR(220) NOT NULL,
    "mime_type" VARCHAR(80) NOT NULL,
    "base64_data" TEXT NOT NULL,
    "alt_text" VARCHAR(240) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "source" VARCHAR(80) NOT NULL DEFAULT 'footer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_slug_idx" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_is_active_idx" ON "landing_pages"("is_active");

-- CreateIndex
CREATE INDEX "landing_sections_landing_page_id_sort_order_idx" ON "landing_sections"("landing_page_id", "sort_order");

-- CreateIndex
CREATE INDEX "landing_sections_is_active_idx" ON "landing_sections"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "landing_sections_landing_page_id_key_key" ON "landing_sections"("landing_page_id", "key");

-- CreateIndex
CREATE INDEX "landing_items_section_id_sort_order_idx" ON "landing_items"("section_id", "sort_order");

-- CreateIndex
CREATE INDEX "landing_items_type_idx" ON "landing_items"("type");

-- CreateIndex
CREATE INDEX "landing_items_is_active_idx" ON "landing_items"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "landing_items_section_id_key_key" ON "landing_items"("section_id", "key");

-- CreateIndex
CREATE INDEX "landing_assets_landing_page_id_sort_order_idx" ON "landing_assets"("landing_page_id", "sort_order");

-- CreateIndex
CREATE INDEX "landing_assets_section_id_idx" ON "landing_assets"("section_id");

-- CreateIndex
CREATE INDEX "landing_assets_item_id_idx" ON "landing_assets"("item_id");

-- CreateIndex
CREATE INDEX "landing_assets_is_active_idx" ON "landing_assets"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "landing_assets_landing_page_id_key_key" ON "landing_assets"("landing_page_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_created_at_idx" ON "newsletter_subscriptions"("created_at");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_is_active_idx" ON "newsletter_subscriptions"("is_active");

-- AddForeignKey
ALTER TABLE "landing_sections" ADD CONSTRAINT "landing_sections_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_items" ADD CONSTRAINT "landing_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "landing_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_assets" ADD CONSTRAINT "landing_assets_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_assets" ADD CONSTRAINT "landing_assets_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "landing_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_assets" ADD CONSTRAINT "landing_assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "landing_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
