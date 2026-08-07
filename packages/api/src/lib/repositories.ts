/**
 * Khởi tạo tất cả repository instances với db singleton.
 * Service layer import từ đây thay vì tự new repository.
 */
import { db } from "autoparts-db";
import {
  ProductRepository,
  CategoryRepository,
  BrandRepository,
} from "autoparts-db/repositories";

export const productRepo = new ProductRepository(db);
export const categoryRepo = new CategoryRepository(db);
export const brandRepo = new BrandRepository(db);
