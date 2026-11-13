import type { APIRoute } from 'astro';
import { settings } from '../lib/content';

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', settings.domain).toString()}\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
