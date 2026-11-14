# NalarTek

Independent technology media exploring Android, engineering, software, AI, and practical technology.

## Development

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
npm run preview
```

## Production URL

The production domain has not been confirmed. The site targets Cloudflare Pages
and will initially use the free `*.pages.dev` subdomain assigned by Cloudflare.
Set that exact URL through the `SITE_URL` environment variable so canonical
URLs, Open Graph image URLs, and structured data are generated correctly:

```sh
SITE_URL=https://your-assigned-name.pages.dev npm run build
```

On Cloudflare Pages, add `SITE_URL` under **Settings > Environment variables**
after the first deployment, using the production URL shown in the dashboard.
Without `SITE_URL`, the build remains domain-neutral: canonical and social image
URLs are omitted rather than pointing at an invented domain.

## Cloudflare Pages

The project uses Astro's static output and does not need the Cloudflare adapter.
Use these dashboard settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `Astro` (or none) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (leave blank) |
| Node version | pinned to `22.23.4` by `.nvmrc` |

`public/_headers` adds security and caching headers, and `public/robots.txt`
allows indexing. No custom domain, DNS record, or nameserver change is required
for a `*.pages.dev` deployment.

After the first deployment, copy the assigned production URL from Cloudflare and
set it as `SITE_URL` in the Pages project's production environment variables,
then trigger a new deployment so absolute metadata URLs are generated.

## Brand assets

Official source assets live in `public/images/`:

- `nalartek-logo.png` (800 × 800)
- `nalartek-banner.png` (2560 × 1440)

The originals are never modified. Optimized delivery variants, favicons, the
web app manifest, and the Open Graph image are derived from them:

```sh
npm run brand:assets
```

That command regenerates:

- `public/favicon.ico`, `public/favicon-32.png`, `public/apple-touch-icon.png`
- `public/icon-192.png`, `public/icon-512.png`
- `public/images/nalartek-logo-128.png`, `public/images/nalartek-logo-256.png`
- `public/images/nalartek-banner-lockup-720.png`,
  `public/images/nalartek-banner-lockup-1440.png`
- `public/images/nalartek-og.png`

The banner used in the footer is a centered crop of the official banner that
removes excess empty space while preserving the original pixels and proportions.
