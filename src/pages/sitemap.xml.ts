import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { albums, publishedActivities, publishedNews, settings } from '../lib/content';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const members = await getCollection('members');
  const paths = [
    '/',
    '/research/',
    '/people/',
    '/publication/',
    '/gallery/',
    '/opening/',
    '/contact/',
    '/alumni/',
    '/news/',
    '/activities/',
    ...members.map((member) => `/${member.data.slug}/`),
    ...albums.map((album) => `/gallery/${album.slug}/`),
    ...publishedNews.map((item) => `/news/${item.slug}/`),
    ...publishedActivities.map((item) => `/activities/${item.slug}/`),
  ];
  const uniquePaths = [...new Set(paths)];
  const urls = uniquePaths
    .map((route) => `  <url><loc>${escapeXml(new URL(route, settings.domain).toString())}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
