# Fash Shot It

Portfolio site for Fash Shot It: photography, videography and drone services in Lagos.

It's built with **React + Vite + TypeScript** and deployed to **Cloudflare Workers**. Cloudflare serves the static assets, and a small Worker handles the contact form.

## Project layout

```
public/images/        Photos, logos and icons (served as-is)
src/data/site.ts      All site content: portfolio, projects, services, skills, testimonials, contact details
src/components/       Page sections (Hero, Portfolio, About, Services, Skills, Testimonials, Contact, …)
src/pages/            Routes: Home (/), Project (/work/:slug), 404
worker/index.ts       Cloudflare Worker: POST /api/contact sends an email via Resend
wrangler.jsonc        Cloudflare config
```

Most content updates only need `src/data/site.ts`:

- **New portfolio tile:** add an entry to `portfolio`. Give it `media` to open in the lightbox, or `project` to link to a project page.
- **New project page:** add an entry to `projects`. It appears at `/work/<slug>`.

## Development

```bash
npm install
cp .dev.vars.example .dev.vars   # add your RESEND_API_KEY to test the contact form locally
npm run dev                      # http://localhost:5173 (the Worker runs locally too)
```

## Deploying to Cloudflare

### Option A: from your machine

```bash
npx wrangler login
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

### Option B: Git integration (deploys on every push)

1. In the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository** and pick this repo.
2. Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
3. After the first deploy, open the Worker's **Settings → Variables and Secrets** and add `RESEND_API_KEY` as a secret.
4. Under **Settings → Domains & Routes**, add `fashshotit.com` as a custom domain.

## Contact form email

The form posts to `/api/contact`. The Worker validates the input, drops bot submissions caught by a honeypot field, and sends the email through [Resend](https://resend.com):

1. Create a Resend account and verify the `fashshotit.com` domain (add the DNS records it gives you in Cloudflare DNS).
2. Create an API key and save it as the `RESEND_API_KEY` secret (see above).
3. Recipients (`CONTACT_TO`) and sender (`CONTACT_FROM`) are set under `vars` in `wrangler.jsonc`. `CONTACT_FROM` must use the verified domain.

If the key isn't set, the form shows a friendly error that points visitors to WhatsApp.

After changing `wrangler.jsonc`, run `npm run cf-typegen` to refresh the Worker types.
