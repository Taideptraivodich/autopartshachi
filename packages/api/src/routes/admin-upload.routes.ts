/**
 * Admin upload route — POST /api/admin/upload
 * Nhận base64 image, lưu vào thư mục uploads, trả về URL công khai.
 * Không cần thêm dependency — dùng Node fs built-in.
 */

import { Router, type Request, type Response } from "express";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { randomBytes } from "node:crypto";
import { logger } from "../lib/logger.js";

// Thư mục lưu ảnh — relative to CWD (packages/api)
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function createAdminUploadRouter(): Router {
  const r = Router();

  // POST /api/admin/upload
  // Body: { dataUrl: "data:image/jpeg;base64,..." }
  r.post("/", async (req: Request, res: Response) => {
    try {
      const { dataUrl } = req.body as { dataUrl?: string };

      if (!dataUrl || typeof dataUrl !== "string") {
        res.status(400).json({ error: "dataUrl is required" });
        return;
      }

      // Parse data URL: data:<mimeType>;base64,<data>
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: "Invalid data URL format" });
        return;
      }

      const [, mimeType, base64Data] = match;
      const ext = ALLOWED_TYPES[mimeType];
      if (!ext) {
        res.status(400).json({ error: `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, GIF` });
        return;
      }

      // Check size
      const bytes = Buffer.from(base64Data, "base64");
      if (bytes.byteLength > MAX_SIZE_MB * 1024 * 1024) {
        res.status(400).json({ error: `File quá lớn. Tối đa ${MAX_SIZE_MB}MB` });
        return;
      }

      // Ensure upload dir exists
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }

      // Generate unique filename
      const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
      const filepath = join(UPLOAD_DIR, filename);

      await writeFile(filepath, bytes);

      // Return public URL — served by express.static
      const url = `/uploads/${filename}`;
      res.status(201).json({ url });
    } catch (err) {
      logger.error("upload error", err);
      res.status(500).json({ error: "Upload thất bại" });
    }
  });

  return r;
}
