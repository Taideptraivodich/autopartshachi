/**
 * CategoryService
 * Tầng business logic cho danh mục sản phẩm.
 * Chỉ được gọi Repository, không được query DB trực tiếp.
 *
 * Kiến trúc: Controller → Service → Repository → Database
 */

import {
  CategoryRepository,
  type Category,
} from "autoparts-db/repositories";

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Danh mục phẳng cho danh sách */
export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  displayOrder: number;
}

/** Danh mục chi tiết với children */
export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  displayOrder: number;
  parent: { id: number; name: string; slug: string } | null;
  children: { id: number; name: string; slug: string; displayOrder: number }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapToItem(cat: Category): CategoryItem {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parentCategoryId: cat.parentCategoryId ?? null,
    displayOrder: cat.displayOrder,
  };
}

// ---------------------------------------------------------------------------
// CategoryService
// ---------------------------------------------------------------------------

export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  /**
   * Lấy tất cả danh mục — trả về danh sách phẳng,
   * frontend tự dựng tree nếu cần.
   */
  async getCategories(): Promise<CategoryItem[]> {
    const cats = await this.categoryRepo.findAll();
    return cats.map(mapToItem);
  }

  /**
   * Lấy chi tiết một danh mục theo slug.
   * Bao gồm parent và danh sách children trực tiếp.
   * Trả về null nếu không tìm thấy.
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
    const cat = await this.categoryRepo.findBySlug(slug);
    if (!cat) return null;

    // Lấy children và parent song song
    const [children, parentCat] = await Promise.all([
      this.categoryRepo.findChildren(cat.id),
      cat.parentCategoryId != null
        ? this.categoryRepo.findById(cat.parentCategoryId)
        : Promise.resolve(undefined),
    ]);

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentCategoryId: cat.parentCategoryId ?? null,
      displayOrder: cat.displayOrder,
      parent: parentCat
        ? { id: parentCat.id, name: parentCat.name, slug: parentCat.slug }
        : null,
      children: [...children]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          displayOrder: c.displayOrder,
        })),
    };
  }
}
