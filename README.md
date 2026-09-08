# Festival Desapegue-se — Wix Headless site

Live at **https://www.festivaldesapeguese.com.br/**, hosted on **Wix**
(site id `cdc2b22d-e3f7-4684-a910-5811ec8084a4`). There is no database and no
Vercel deployment; the previous Next.js/Prisma application is not part of this
branch.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The whole site — a single pre-bundled page. **The source of truth; edit this.** |
| `dist/index.html` | Build output (a copy). Generated; not committed. |
| `wix.config.json` | Wix project link — `siteId`, and `appId` (also the public OAuth client id). |

The page is a self-contained bundle: React and the page's own component are
embedded in `index.html`, inside a `<script type="__bundler/template">` element
holding the inner document as a **JSON-encoded string**.

> **Editing that template:** every `</` inside it is escaped as `</`. Leave
> them escaped — an unescaped `</` closes the outer `<script>` tag early and
> breaks the page. Decode with a JSON parser, edit, re-encode, then re-apply the
> escaping. Don't hand-edit the encoded line.

## Publish

```bash
npm run release
```

That is `npm run build` (copies `index.html` into `dist/`) then `wix release`.
`wix.config.json` points `outputDirectory` at `./dist` so only the page is
published — never the repo root, which would upload `.git`.

Requires a Wix CLI session: `npx @wix/cli@latest login`.

## Wix features in use

Exactly one, because that is all the page needs — everything else on the page is
static or an outbound link (tickets go to Sympla, community to WhatsApp).

**Newsletter signup** — Wix Forms (New), form id `91fb9aa6-429e-443d-83de-fdaa3fb4c175`:

- `email` → contact mapping `EMAIL`, so a submission creates or updates a CRM contact.
- `subscribe` → contact mapping `SUBSCRIPTION` on the `EMAIL` channel. This is what
  sets `emailSubscriptions.subscriptionStatus = SUBSCRIBED`, which is what **Email
  Marketing** segments on. Sent as `true` on every submit — the form exists solely
  to join the newsletter, so submitting it is the opt-in (single opt-in).

Subscribers appear under **Contacts** in the Wix dashboard; campaigns are composed
there under **Marketing → Email Marketing**. Email Marketing needs no app install.

### How the browser talks to Wix

Plain REST, not the SDK — the page has no bundler to import an SDK into:

1. Mint an anonymous visitor token from the public `clientId` at `/oauth2/token`.
2. `POST /form-submission-service/v4/submissions`.

Two things that bite:

- The token goes in `Authorization` **raw, with no `Bearer ` prefix**.
- The token is cached in `localStorage` and **refreshed**, not re-minted — a fresh
  anonymous grant is a *new* visitor identity.

A visitor can create submissions but cannot read them back (that needs the owner
scope), so the `200` response is the only receipt. Statuses `CONFIRMED`, `PENDING`
and `PAYMENT_WAITING` all mean the submission exists — treat all three as success,
or visitors resubmit and the owner gets duplicates.
