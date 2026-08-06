// ============================================
// SHARED TYPES
// ============================================

// Navigation
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Meta
export interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

// API Response shape (for future use)
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  error?: string;
}

// Size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';

// Badge variants
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
