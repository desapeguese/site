# Landing editável e API de conteúdo do Festival Desapegue-se

## Contexto

O projeto `festival-desapegue-se-landingage` é uma landing page em Next.js 15. A página principal está em `src/app/[locale]/(landing-page)/(root)` e hoje concentra quase todo o conteúdo em strings e arrays locais dentro dos componentes:

- `MainBanner`: logos, título, descrição e imagens do carrossel principal.
- `DesapegarParaRegenerar`, `PillaresCards` e `StatisticsCard`: título, descrição, pilares e números de impacto.
- `NossosCompromissos` e `CompromissosCards`: título, descrição e cards de compromissos.
- `NossaMissao`: texto institucional, ODS e imagens de fundo.
- `NossaTragetoria` e `TrajetoriaTimeline`: timeline histórica.
- `ReconhecimentoLegal`: texto, selo legal e imagens de fundo.
- `JusticaClimatica`: edição de março de 2026, programação, espaços temáticos e CTA de ingresso.
- `Footer`: newsletter, textos institucionais, links e redes sociais.

O diretório irmão `festival-desapegue-se-api` já contém uma base NestJS 11 com Prisma, PostgreSQL, autenticação JWT, roles `ADMIN`/`MEMBER`, Swagger/Redoc, seed e Docker Compose local. Essa base será aproveitada e ajustada para o domínio do Festival.

## Decisões aprovadas

- Usar um modelo relacional estruturado, não um JSON único.
- Criar uma tela de login na landing para ativar modo administrador.
- Manter criação e gestão de usuários apenas pela API, para uso via Insomnia.
- Salvar logos e imagens editáveis em Base64 no banco.
- Publicar cada alteração imediatamente ao salvar, sem rascunho ou botão separado de publicação.
- Não criar um dashboard/CMS separado; a edição acontece na própria landing page.
- Preservar a aparência e a estrutura atual do site público.
- Subir banco PostgreSQL local para desenvolvimento, usando senha `2611` caso seja necessário conectar no PostgreSQL local do usuário.

## Objetivos

1. Transformar o conteúdo fixo da landing em conteúdo gerenciado pela API.
2. Popular o banco com os valores atuais da landing como default.
3. Permitir edição inline na própria página quando o usuário estiver autenticado como `ADMIN`.
4. Permitir troca de logos, imagens, títulos, descrições, cards, ícones, cores, ordem e status dos itens.
5. Implementar newsletter persistida na API.
6. Manter leitura pública rápida e resiliente para a landing.
7. Cobrir API e integração com testes focados nos fluxos críticos.

## Fora de escopo

- Dashboard administrativo separado.
- Fluxo de rascunho, revisão ou publicação manual.
- Upload em disco, S3, Azure Blob ou outro storage externo.
- Criação de usuários pela landing.
- Editor rico completo estilo WordPress com blocos arbitrários. O comportamento será inline e estruturado conforme os componentes atuais.

## Arquitetura

O frontend Next.js consumirá um endpoint público que retorna a landing completa já normalizada para renderização. Quando o usuário fizer login como administrador, a página usará os endpoints protegidos para atualizar cada trecho editável.

Fluxo público:

1. Next.js chama `GET /api/v1/landing-pages/default`.
2. API consulta PostgreSQL.
3. API retorna metadados, seções, itens e assets ordenados.
4. Landing renderiza com fallback local durante a migração, para evitar página quebrada se a API estiver indisponível em desenvolvimento.

Fluxo admin:

1. Usuário acessa `/pt/admin/login`.
2. Frontend chama `POST /api/v1/auth/login`.
3. Token JWT é armazenado no cliente.
4. A landing exibe controles discretos de edição inline.
5. Cada salvar chama o endpoint admin correspondente.
6. A API persiste e o conteúdo fica público imediatamente.

## Modelo de dados

### LandingPage

Representa a página editável.

Campos principais:

- `id`
- `slug`, com default `default`
- `locale`, com default `pt-BR`
- `seoTitle`
- `seoDescription`
- `isActive`
- `createdAt`
- `updatedAt`

### LandingSection

Representa uma seção renderizável da landing.

Campos principais:

- `id`
- `landingPageId`
- `key`, como `hero`, `regenerar`, `compromissos`, `missao`, `trajetoria`, `reconhecimento`, `programacao`, `footer`
- `type`
- `title`
- `subtitle`
- `description`
- `metadata` em JSON para campos específicos de layout que não justifiquem tabela própria
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### LandingItem

Representa itens internos de uma seção: cards, métricas, timeline, eventos, espaços temáticos, ODS, links de footer e redes sociais.

Campos principais:

- `id`
- `sectionId`
- `key`
- `type`, como `pillar_card`, `commitment_card`, `stat`, `timeline_event`, `program_event`, `thematic_space`, `ods_logo`, `footer_link`, `social_link`
- `title`
- `subtitle`
- `description`
- `value`
- `icon`
- `color`
- `url`
- `metadata` em JSON para campos específicos, como data, dia da semana, local, destaque ou classe visual
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### LandingAsset

Representa imagens/logos salvos em Base64.

Campos principais:

- `id`
- `landingPageId`
- `sectionId`, opcional
- `itemId`, opcional
- `key`, como `main_logo_light`, `main_logo_dark`, `hero_carousel_01`, `mission_background_01`
- `type`, como `logo`, `image`, `background`
- `theme`, como `light`, `dark` ou `null`
- `fileName`
- `mimeType`
- `base64Data`
- `altText`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

### NewsletterSubscription

Representa uma inscrição pública na newsletter.

Campos principais:

- `id`
- `email`, único e normalizado em minúsculas
- `source`, default `footer`
- `isActive`
- `createdAt`
- `updatedAt`

### Auth e usuários

Manter o modelo atual de `User`, `RefreshToken`, roles e JWT. A seed deve criar um administrador inicial adequado ao Festival. As rotas de criação/listagem/edição de usuários continuam disponíveis apenas para uso autenticado e, quando aplicável, `ADMIN`.

## Conteúdo inicial do seed

O seed deve reproduzir o conteúdo atual da landing:

- Hero com logo claro, logo escuro, título `Festival Desapegue-se`, descrição e carrossel atual.
- Seção `Desapegar para Regenerar` com texto, pilares e estatísticas.
- Seção `Nossos Compromissos` com os oito cards atuais.
- Seção `Nossa Missão` com texto, ODS e backgrounds atuais.
- Seção `Nossa Trajetória` com timeline atual.
- Seção `Reconhecimento Legal` com lei, descrição e backgrounds atuais.
- Seção `Edição Março 2026` com programação, espaços temáticos e CTA do Sympla.
- Footer com newsletter, links, redes sociais, comunidade WhatsApp e textos institucionais.

As imagens existentes em `public/img` serão lidas no seed, convertidas para Base64 e gravadas em `LandingAsset`.

## Contratos de API

### Público

- `GET /api/v1/landing-pages/default`: retorna a landing completa para renderização pública.
- `POST /api/v1/newsletter/subscriptions`: cria ou reativa inscrição de newsletter por e-mail.

### Admin

Todos os endpoints abaixo exigem JWT válido e role `ADMIN`.

- `PATCH /api/v1/admin/landing-pages/default`: atualiza metadados gerais.
- `PATCH /api/v1/admin/landing-sections/:id`: edita título, descrição, metadados, ordem e visibilidade.
- `POST /api/v1/admin/landing-sections/:sectionId/items`: cria item em uma seção.
- `PATCH /api/v1/admin/landing-items/:id`: edita item.
- `DELETE /api/v1/admin/landing-items/:id`: remove ou desativa item.
- `POST /api/v1/admin/landing-assets`: cria asset Base64.
- `PATCH /api/v1/admin/landing-assets/:id`: troca Base64, alt, ordem, tema ou status.

## Frontend

### Login admin

Criar rota `/[locale]/admin/login` com formulário de e-mail e senha. A tela autentica com a API e salva a sessão no cliente. Se o usuário autenticado não for `ADMIN`, a edição inline não é exibida.

### Cliente de API

Criar um cliente pequeno e tipado para:

- buscar o conteúdo público da landing;
- autenticar;
- enviar atualizações admin com bearer token;
- enviar newsletter.

### Renderização dinâmica

Adaptar os componentes atuais para receber dados por props, mantendo o layout e classes atuais. Arrays locais serão substituídos por dados vindos da API, com defaults locais apenas como fallback de migração.

### Edição inline

Quando `ADMIN` estiver ativo:

- textos editáveis recebem affordance discreta;
- clicar em título/descrição abre campo inline;
- cards mostram ações para editar, remover/desativar e mover ordem;
- imagens/logos permitem seleção de arquivo local, conversão para Base64 e envio à API;
- newsletter segue pública e não depende de login;
- salvar exibe feedback via `sonner`.

## Testes

### API

- Services de landing: montagem do payload público, ordenação, filtros por ativo e atualização.
- Validação Zod: payloads inválidos para seção, item, asset e newsletter.
- Autorização: rotas admin rejeitam anônimo e `MEMBER`, aceitam `ADMIN`.
- Newsletter: normalização de e-mail, unicidade e reativação idempotente.
- Seed: criação de página default, seções esperadas, assets Base64 e admin inicial.
- E2E: health, auth, leitura pública, login admin e atualização de um campo.

### Frontend

- Cliente de API: base URL, headers de auth, tratamento de erro.
- Helpers de edição: conversão de arquivo para Base64 e atualização otimista/rollback simples.
- Componentes: renderizam conteúdo vindo da API preservando fallback.
- Fluxo manual ou E2E leve: login admin, edição de texto, troca de imagem e cadastro de newsletter.

## Verificação final esperada

- API: `pnpm test`, `pnpm test:e2e`, `pnpm build`.
- Frontend: `pnpm lint` quando compatível com Next 15 do projeto, `pnpm build`.
- Banco local: `pnpm db:setup` ou sequência equivalente com Prisma migrate e seed.

## Riscos e mitigação

- Base64 aumenta o tamanho do banco e payloads. Mitigação: limitar tamanho máximo por asset e retornar apenas os assets usados pela landing.
- Edição inline pode quebrar layout se textos muito longos forem salvos. Mitigação: limites de validação e componentes com quebra responsiva.
- API indisponível pode deixar a landing sem conteúdo em desenvolvimento. Mitigação: fallback local durante a migração e mensagens de erro controladas.
- Duplicidade entre conteúdo local e seed pode divergir. Mitigação: após migração, tratar o banco como fonte principal e manter defaults apenas para fallback técnico.

## Critérios de aceite

- A landing pública continua visualmente equivalente ao estado atual após carregar conteúdo do banco.
- O banco local contém os defaults atuais da landing após seed.
- Admin consegue fazer login pela landing.
- Admin consegue editar textos, cards, ordem, ícones, cores e imagens Base64 na própria landing.
- Alterações salvas aparecem imediatamente para usuários públicos.
- Newsletter grava e-mails na API e evita duplicidade.
- Rotas de criação/gestão de usuários permanecem disponíveis pela API e não aparecem como tela na landing.
- Testes e builds definidos passam ou qualquer limitação fica documentada com evidência.
