/**
 * SiteSettingsService
 * Business logic cho site_settings key-value store.
 */

import { SiteSettingsRepository, type SiteSetting } from "autoparts-db/repositories";

export type SettingsMap = Record<string, string>;

export class SiteSettingsService {
  constructor(private readonly repo: SiteSettingsRepository) {}

  /** Return all settings as a flat key→value map. */
  async getAll(): Promise<SettingsMap> {
    const rows = await this.repo.findAll();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  /** Upsert one setting. */
  async set(key: string, value: string): Promise<SiteSetting> {
    return this.repo.set(key, value);
  }

  /** Bulk upsert from a map. */
  async setMany(entries: SettingsMap): Promise<void> {
    await this.repo.setMany(entries);
  }
}
