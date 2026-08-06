export const SITE_CONFIG = {
  name: 'Phụ Tùng Ô Tô',
  tagline: 'Phụ tùng chính hãng – Tra cứu nhanh – Giao hàng toàn quốc',
  description: 'Cung cấp phụ tùng ô tô chính hãng, đa thương hiệu. Tra cứu theo hãng xe, mã OEM, hoặc danh mục. Giao hàng toàn quốc.',
  url: 'https://phutuong.vn',
  phone: '1900 xxxx',
  email: 'info@phutuong.vn',
  address: 'TP. Hồ Chí Minh, Việt Nam',
  workingHours: 'Thứ 2 – Thứ 7: 8:00 – 17:30',
} as const;

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/san-pham',
  VEHICLE: '/hang-xe',
  CATEGORY: '/danh-muc',
  BRAND: '/thuong-hieu',
  OEM: '/oem',
  BLOG: '/blog',
  CONTACT: '/lien-he',
  NOT_FOUND: '/404',
} as const;

export const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1440,
} as const;
