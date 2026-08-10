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
}
