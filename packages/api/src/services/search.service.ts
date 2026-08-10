/**
 * SearchService
 * Business logic cho tìm kiếm sản phẩm đa trường.
 */

import {
  SearchRepository,
  type SearchResult,
  type SuggestionItem,
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

    // Fire-and-forget — lỗi analytics không làm fail search
    this.searchRepo.logSearch(trimmed).catch(() => {});

    return { ...result, query: trimmed };
  }

  async suggest(query: string): Promise<SuggestionItem[]> {
    const trimmed = query?.trim() ?? "";
    if (trimmed.length < 2) return [];
    return this.searchRepo.suggest(trimmed, 8);
  }

  async getPopular(limit = 4): Promise<string[]> {
    return this.searchRepo.getPopularKeywords(limit);
  }
}
