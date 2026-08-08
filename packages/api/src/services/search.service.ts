/**
 * SearchService
 * Business logic cho tìm kiếm sản phẩm đa trường.
 */

import {
  SearchRepository,
  type SearchResult,
} from "autoparts-db/repositories";

export class SearchService {
  constructor(private readonly searchRepo: SearchRepository) {}

  async search(
    query: string,
    page = 1,
    pageSize = 24,
  ): Promise<SearchResult & { query: string }> {
    const trimmed = query?.trim() ?? "";
    if (!trimmed) {
      return {
        query: trimmed,
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
    const result = await this.searchRepo.search(trimmed, page, pageSize);
    return { ...result, query: trimmed };
  }
}
