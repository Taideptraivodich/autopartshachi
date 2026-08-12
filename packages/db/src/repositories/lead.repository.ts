import { eq, desc } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { lead } from "../db/schema/lead.js";

export interface CreateLeadInput {
  name: string;
  phone: string;
  message?: string;
  productName?: string;
  productSku?: string;
  source?: string;
}

export type Lead = typeof lead.$inferSelect;

export interface LeadListParams {
  page?: number;
  pageSize?: number;
  onlyUnread?: boolean;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

export class LeadRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateLeadInput): Promise<number> {
    const rows = await this.db
      .insert(lead)
      .values({
        name: data.name.trim(),
        phone: data.phone.trim(),
        message: data.message?.trim(),
        productName: data.productName,
        productSku: data.productSku,
        source: data.source ?? "website",
      })
      .returning({ id: lead.id });
    return rows[0].id;
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async findMany(params: LeadListParams = {}): Promise<PaginatedLeads> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 30));
    const offset = (page - 1) * pageSize;

    const allRows = await this.db
      .select()
      .from(lead)
      .orderBy(desc(lead.createdAt));

    const filtered = params.onlyUnread
      ? allRows.filter((r) => !r.isRead)
      : allRows;

    const total = filtered.length;
    const items = filtered.slice(offset, offset + pageSize);

    return { items, total, page, pageSize };
  }

  async markRead(id: number, isRead: boolean): Promise<Lead | undefined> {
    const rows = await this.db
      .update(lead)
      .set({ isRead })
      .where(eq(lead.id, id))
      .returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(lead)
      .where(eq(lead.id, id))
      .returning({ id: lead.id });
    return rows.length > 0;
  }
}
