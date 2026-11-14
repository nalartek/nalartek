import { getCollection, type CollectionEntry } from 'astro:content';
import { categories, type CategorySlug } from './categories';

export type ArticleEntry = CollectionEntry<'articles'>;

export const PAGE_SIZE = 4;
export const WORDS_PER_MINUTE = 200;

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function byNewest(first: ArticleEntry, second: ArticleEntry) {
  return second.data.pubDate.getTime() - first.data.pubDate.getTime();
}

export async function getPublishedArticles(): Promise<ArticleEntry[]> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const slugs = new Set<string>();

  for (const article of articles) {
    if (slugs.has(article.data.slug)) {
      throw new Error(`Slug artikel duplikat: "${article.data.slug}"`);
    }
    slugs.add(article.data.slug);
  }

  return articles.sort(byNewest);
}

export function getCategoryArticles(
  articles: ArticleEntry[],
  category: CategorySlug,
): ArticleEntry[] {
  return articles.filter((article) => article.data.category === category);
}

export function getCategoryStats(articles: ArticleEntry[]) {
  return categories.map((category) => ({
    ...category,
    count: getCategoryArticles(articles, category.slug).length,
  }));
}

export function getFeaturedArticles(
  articles: ArticleEntry[],
  limit = 3,
): ArticleEntry[] {
  return articles.filter((article) => article.data.featured).slice(0, limit);
}

export function getLatestArticles(
  articles: ArticleEntry[],
  limit = 3,
  exclude: string[] = [],
): ArticleEntry[] {
  const excluded = new Set(exclude);
  return articles
    .filter((article) => !excluded.has(article.data.slug))
    .slice(0, limit);
}

export function getRelatedArticles(
  current: ArticleEntry,
  articles: ArticleEntry[],
  limit = 3,
): ArticleEntry[] {
  const sameCategory = articles.filter(
    (article) =>
      article.data.slug !== current.data.slug &&
      article.data.category === current.data.category,
  );

  const selected = sameCategory.slice(0, limit);
  const selectedSlugs = new Set(selected.map((article) => article.data.slug));

  for (const article of articles) {
    if (selected.length >= limit) break;
    if (
      article.data.slug !== current.data.slug &&
      !selectedSlugs.has(article.data.slug)
    ) {
      selected.push(article);
      selectedSlugs.add(article.data.slug);
    }
  }

  return selected;
}

export function countWords(body: string): number {
  const plainText = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .trim();

  return plainText ? plainText.split(/\s+/).length : 0;
}

export function getReadingTime(body: string): number {
  return Math.max(1, Math.ceil(countWords(body) / WORDS_PER_MINUTE));
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function getArticlePath(slug: string): string {
  return `/articles/${slug}/`;
}

export function getCategoryPath(slug: string): string {
  return `/categories/${slug}/`;
}

export function getArchivePagePath(page: number, basePath = '/articles'): string {
  return page <= 1 ? `${basePath}/` : `${basePath}/page/${page}/`;
}
