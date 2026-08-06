import type { PageMeta } from '../types';
import { SITE_CONFIG } from '../constants/site';

export function buildPageTitle(title?: string): string {
  if (!title) return SITE_CONFIG.name;
  return `${title} | ${SITE_CONFIG.name}`;
}

export function buildMeta(meta: PageMeta): PageMeta {
  return {
    title: buildPageTitle(meta.title),
    description: meta.description ?? SITE_CONFIG.description,
    canonical: meta.canonical,
    ogTitle: meta.ogTitle ?? buildPageTitle(meta.title),
    ogDescription: meta.ogDescription ?? meta.description ?? SITE_CONFIG.description,
    ogImage: meta.ogImage,
    noIndex: meta.noIndex ?? false,
  };
}
