import React from 'react';
import { useEffect } from 'react';
import type { PageMeta } from '../../types';
import { buildMeta } from '../../lib/seo';

interface MetaTagsProps extends Partial<PageMeta> {
  title: string;
}

const MetaTags: React.FC<MetaTagsProps> = (props) => {
  const meta = buildMeta(props as PageMeta);

  useEffect(() => {
    // Title
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
    if (meta.ogTitle)       setMeta('og:title', meta.ogTitle, 'property');
    if (meta.ogDescription) setMeta('og:description', meta.ogDescription, 'property');
    if (meta.ogImage)       setMeta('og:image', meta.ogImage, 'property');
    if (meta.noIndex)       setMeta('robots', 'noindex,nofollow');

    // Canonical
    if (meta.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = meta.canonical;
    }
  }, [meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.noIndex, meta.canonical]);

  return null;
};

export default MetaTags;
