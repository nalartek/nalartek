// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const rawSiteUrl = process.env.SITE_URL || env.SITE_URL || 'https://web.nalartek.workers.dev';;
const site = rawSiteUrl ? new URL(rawSiteUrl).origin : undefined;

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
