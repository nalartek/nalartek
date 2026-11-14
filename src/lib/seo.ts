export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ArticleMeta {
  headline?: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  section: string;
  tags: string[];
  wordCount?: number;
  readingTimeMinutes?: number;
}
