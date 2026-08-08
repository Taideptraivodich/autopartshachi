/**
 * OemService
 * Business logic cho tra cứu mã OEM.
 */

import {
  OemRepository,
  type OemSearchResult,
} from "autoparts-db/repositories";

export interface OemLookupResult {
  query: string;
  results: OemSearchResult[];
}

export class OemService {
  constructor(private readonly oemRepo: OemRepository) {}

  async lookupByCode(code: string): Promise<OemLookupResult> {
    const trimmed = code?.trim() ?? "";
    if (!trimmed) {
      return { query: trimmed, results: [] };
    }
    const results = await this.oemRepo.findProductsByOemCode(trimmed);
    return { query: trimmed, results };
  }
}
