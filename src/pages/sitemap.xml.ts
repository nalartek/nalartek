import type { APIRoute } from 'astro';
import {
  PAGE_SIZE,
  getArchivePagePath,
  getPublishedArticles,
} from '../lib/articles';
import { categories } from '../lib/categories';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(
  site: URL,
  path: string,
  lastmod?: string,
): string {
  const lines = [`    <loc>${escapeXml(new URL(path, site).href)}</loc>`];

  if (lastmod) {
    lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  }

  return `  <url>\n${lines.join('\n')}\n  </url>`;
}

export const GET: APIRoute = async ({ site }) => {
  const articles = site ? await getPublishedArticles() : [];
  const entries: string[] = [];

  if (site) {
    const staticPaths = [
      '/',
      '/articles/',
      '/categories/',
      '/about/',
      '/contact/',
      '/editorial-policy/',
'/privacy-policy/',
'/terms/',
    ];

    for (const path of staticPaths) {
      entries.push(urlEntry(site, path));
    }

    const totalPages = Math.ceil(articles.length / PAGE_SIZE);
    for (let page = 2; page <= totalPages; page += 1) {
      entries.push(urlEntry(site, getArchivePagePath(page)));
    }

    for (const category of categories) {
      entries.push(urlEntry(site, `/categories/${category.slug}/`));
    }

    for (const article of articles) {
      entries.push(
        urlEntry(
          site,
          `/articles/${article.data.slug}/`,
          (article.data.updatedDate ?? article.data.pubDate).toISOString(),
        ),
      );
    }
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
