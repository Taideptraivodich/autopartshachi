import { eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { siteSettings, type SiteSetting } from "../db/schema/settings.js";

export { type SiteSetting };

export class SiteSettingsRepository {
  constructor(private readonly db: Database) {}

  /** Return all settings as an array of {key, value}. */
  async findAll(): Promise<SiteSetting[]> {
    return this.db.select().from(siteSettings).orderBy(siteSettings.key);
  }

  /** Return a single setting by key. */
  async findByKey(key: string): Promise<SiteSetting | undefined> {
    const rows = await this.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);
    return rows[0];
  }

  /** Upsert a setting. */
  async set(key: string, value: string): Promise<SiteSetting> {
    const rows = await this.db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
      .returning();
    return rows[0]!;
  }

  /** Bulk upsert — convenience for the admin settings page. */
  async setMany(entries: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value);
    }
  }
}
