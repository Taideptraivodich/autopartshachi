export const SITE_CONFIG = {
  name: 'Công ty TNHH PHỤ TÙNG Ô TÔ HACHI',
  tagline: 'MST: 3603812751',
  description: 'Công ty TNHH PHỤ TÙNG Ô TÔ HACHI.',
  url: 'https://phutuong.vn',
  phone: '0817600050',
  email: 'Hachiauto139@gmail.com',
  address: 'Số 139C Đường Nguyễn Bá Học, KP2, Phường Tân Mai, Thành phố Biên Hoà, Tỉnh Đồng Nai, Việt Nam',
  workingHours: 'Thứ 2 – Thứ 7: 8:00 – 17:30',
  zaloPhone: '0817600050',
  // Bật/tắt tính năng tra cứu mã OEM trên toàn site.
  // TODO: chuyển sang site_settings (DB, chỉnh từ admin) khi backend hỗ trợ key-value settings.
  showOem: false,
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
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;
