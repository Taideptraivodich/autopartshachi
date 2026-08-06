import type { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Sản phẩm', href: '/san-pham' },
  {
    label: 'Hãng xe',
    href: '/hang-xe',
    children: [
      { label: 'Toyota', href: '/hang-xe/toyota' },
      { label: 'Honda', href: '/hang-xe/honda' },
      { label: 'Hyundai', href: '/hang-xe/hyundai' },
      { label: 'Kia', href: '/hang-xe/kia' },
      { label: 'Mazda', href: '/hang-xe/mazda' },
      { label: 'Ford', href: '/hang-xe/ford' },
    ],
  },
  { label: 'Danh mục', href: '/danh-muc' },
  { label: 'Thương hiệu', href: '/thuong-hieu' },
  { label: 'OEM', href: '/oem' },
  { label: 'Blog', href: '/blog' },
  { label: 'Liên hệ', href: '/lien-he' },
];

export const QUICK_LINKS: NavItem[] = [
  { label: 'Sản phẩm', href: '/san-pham' },
  { label: 'Hãng xe', href: '/hang-xe' },
  { label: 'Danh mục', href: '/danh-muc' },
  { label: 'Thương hiệu', href: '/thuong-hieu' },
  { label: 'OEM', href: '/oem' },
  { label: 'Blog', href: '/blog' },
  { label: 'Liên hệ', href: '/lien-he' },
];
