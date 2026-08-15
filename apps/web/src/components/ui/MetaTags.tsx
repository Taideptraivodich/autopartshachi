import React from 'react';
import { useEffect } from 'react';
import type { PageMeta } from '../../types';
import { buildMeta } from '../../lib/seo';
import { SITE_CONFIG } from '../../constants/site';

interface MetaTagsProps extends Partial<PageMeta> {
  title: string;
}

function getCanonicalUrl(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window === 'undefined') return SITE_CONFIG.url;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return `${SITE_CONFIG.url}${path === '/' ? '/' : path}`;
}

const MetaTags: React.FC<MetaTagsProps> = (props) => {
  const meta = buildMeta(props as PageMeta);
  const canonical = getCanonicalUrl(meta.canonical);

  useEffect(() => {
    document.documentElement.lang = 'vi';
    document.title = meta.title ?? '';

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (meta.description) setMeta('description', meta.description);
    setMeta('og:title', meta.ogTitle ?? meta.title ?? SITE_CONFIG.name, 'property');
    setMeta('og:description', meta.ogDescription ?? meta.description ?? SITE_CONFIG.description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:site_name', SITE_CONFIG.name, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', meta.ogTitle ?? meta.title ?? SITE_CONFIG.name);
    setMeta('twitter:description', meta.ogDescription ?? meta.description ?? SITE_CONFIG.description);
    if (meta.ogImage) setMeta('og:image', meta.ogImage, 'property');
    if (meta.noIndex) {
      setMeta('robots', 'noindex,nofollow');
    } else {
      setMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    }

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.noIndex, canonical]);

  return null;
};

export default MetaTags;
