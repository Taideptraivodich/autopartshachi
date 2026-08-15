import type { PageMeta } from '../types';
import { SITE_CONFIG } from '../constants/site';

const SHORT_BRAND = 'HACHI';

export function buildPageTitle(title?: string): string {
  if (!title) return `${SHORT_BRAND} | Phụ tùng ô tô chính hãng`;
  return `${title} | ${SHORT_BRAND}`;
}

export function buildMeta(meta: PageMeta): PageMeta {
  const description = meta.description ?? SITE_CONFIG.description;
  return {
    title: buildPageTitle(meta.title),
    description,
    canonical: meta.canonical,
    ogTitle: meta.ogTitle ?? buildPageTitle(meta.title),
    ogDescription: meta.ogDescription ?? description,
    ogImage: meta.ogImage,
    noIndex: meta.noIndex ?? false,
  };
}
