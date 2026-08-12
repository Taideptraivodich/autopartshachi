/**
 * SiteSettingsContext
 * Fetch /api/settings một lần khi app khởi động.
 * Cung cấp phone, zaloPhone, workingHours cho toàn bộ app.
 * Fallback về SITE_CONFIG nếu chưa load xong hoặc lỗi.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SITE_CONFIG } from '../constants/site';

const API_BASE = 'http://localhost:3001/api';

export interface SiteSettings {
  phone: string;
  zaloPhone: string;
  workingHours: string;
  showOem: boolean;
}

const defaultSettings: SiteSettings = {
  phone: SITE_CONFIG.phone,
  zaloPhone: SITE_CONFIG.zaloPhone,
  workingHours: SITE_CONFIG.workingHours,
  showOem: SITE_CONFIG.showOem,
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((body: { data: Record<string, string> }) => {
        const map = body.data ?? {};
        setSettings({
          phone: map['hotline'] || SITE_CONFIG.phone,
          zaloPhone: map['zalo_phone'] || SITE_CONFIG.zaloPhone,
          workingHours: map['working_hours'] || SITE_CONFIG.workingHours,
          showOem: map['show_oem'] === 'true',
        });
      })
      .catch(() => { /* giữ default */ });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
