# Unlock New Skill — Portfolio (Next.js + Prisma)

Personal portfolio web app. Public homepage (intro, tech stack, projects, CV)
+ an admin panel to edit everything. Content lives in Postgres via Prisma.

- **Framework:** Next.js 14 (App Router), React 18
- **Styling:** Tailwind CSS + shadcn/ui + anime.js/Lenis (smooth scroll)
- **Data:** Prisma → Postgres. CV PDFs stored as `bytea`, served at `/api/cv/[id]`
- **Auth:** single admin — password + signed JWT cookie (`jose`)
- **Rendering:** homepage is ISR (tag `portfolio`); admin edits call `revalidateTag`

## 1. Setup env

Copy `.env.example` → `.env.local`:

| Var | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase: Settings → Database) |
| `ADMIN_PASSWORD` | your admin login password |
| `AUTH_SECRET` | random 32+ chars — `openssl rand -base64 32` |

## 2. DB schema + seed

```bash
npm install
npm run db:push     # create tables from prisma/schema.prisma
npm run db:seed     # load the original portfolio content
```

> `db:push` needs a **direct** connection (port 5432). If your `DATABASE_URL`
> is the pooled pgbouncer one, temporarily point it at the direct URL for push.

## 3. Run

```bash
npm run dev         # http://localhost:3000
npm run build       # production build (also lints)
```

- Public site: `/`
- Admin: `/admin` (redirects to `/login`)

## 4. Admin

Login at `/login` with `ADMIN_PASSWORD`. Sections:

- **Trang chủ** — name, tagline, **intro paragraphs (text giới thiệu)**, phone,
  facebook, avatar, tech-stack heading. Intro = one paragraph per line, unlimited.
- **Tech stack** — add/remove technologies (name + image URL + order)
- **Dự án** — CRUD projects (name, description, links, image, order)
- **CV** — upload PDF (stored in DB, auto-active), switch active, delete

Saving triggers `revalidateTag('portfolio')` so the homepage updates without a redeploy.

## 5. Deploy (Vercel)

Push to GitHub → import in Vercel → add env vars → deploy. `prisma generate`
runs automatically via the `postinstall` script. Free on `*.vercel.app`.

## Notes

- If `DATABASE_URL` is missing, the site still renders using bundled defaults
  (`src/lib/portfolio-defaults.js`) — no crash.
- Prisma columns are camelCase; `src/lib/mappers.js` maps them to the snake_case
  shape the components/forms use.
- Images use `<img>` on purpose (external URLs), not `next/image`.
