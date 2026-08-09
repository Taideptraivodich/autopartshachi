import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Input, Select, Textarea, Checkbox } from "../../../components/ui";
import {
  createProduct,
  updateProduct,
  fetchProductAdminById,
  type AdminProductImagePayload,
  type AdminProductCompatibilityPayload,
} from "../../../features/admin/api/admin-product.api";
import {
  fetchAllBrands,
  fetchAllCategories,
  fetchAllVehicleBrands,
  fetchVehicleBrandBySlug,
  fetchVehicleGenerationsByModelId,
} from "../../../features/product/api/product.api";
import type {
  BrandListItem,
  CategoryListItem,
  VehicleBrandListItem,
  VehicleModelItem,
  VehicleGenerationItem,
} from "../../../features/product/api/types";

const STATUS_OPTIONS = [
  { value: "con_hang", label: "Còn hàng" },
  { value: "het_hang", label: "Hết hàng" },
  { value: "ngung_kinh_doanh", label: "Ngừng kinh doanh" },
];

const POSITION_OPTIONS = [
  { value: "chung", label: "Chung" },
  { value: "truoc", label: "Trước" },
  { value: "sau", label: "Sau" },
  { value: "truoc_trai", label: "Trước trái" },
  { value: "truoc_phai", label: "Trước phải" },
  { value: "sau_trai", label: "Sau trái" },
  { value: "sau_phai", label: "Sau phải" },
];

function slugifyPreview(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CompatibilityRow {
  key: string;
  vehicleBrandId: string;
  models: VehicleModelItem[];
  vehicleModelId: string;
  generations: VehicleGenerationItem[];
  vehicleGenerationId: string;
  installationPosition: string;
}

let rowKeySeq = 0;
function newRowKey(): string {
  rowKeySeq += 1;
  return `row-${rowKeySeq}`;
}

const AdminProductFormPage: React.FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  // ── reference data ─────────────────────────────────────────────────────
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrandListItem[]>([]);

  // ── form state ────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [productBrandId, setProductBrandId] = useState("");
  const [status, setStatus] = useState("con_hang");
  const [description, setDescription] = useState("");
  const [specification, setSpecification] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [images, setImages] = useState<AdminProductImagePayload[]>([]);
  const [oemCodesText, setOemCodesText] = useState("");
  const [compatRows, setCompatRows] = useState<CompatibilityRow[]>([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugPreview = useMemo(() => slugifyPreview(name), [name]);

  // ── load reference data ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [b, c, vb] = await Promise.all([
          fetchAllBrands(),
          fetchAllCategories(),
          fetchAllVehicleBrands(),
        ]);
        setBrands(b.data);
        setCategories(c.data);
        setVehicleBrands(vb.data);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, []);

  // ── load existing product when editing ───────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchProductAdminById(Number(id));
        setName(data.name);
        setSku(data.sku);
        setProductBrandId(String(data.productBrandId));
        setStatus(data.status);
        setDescription(data.description ?? "");
        setSpecification(data.specification ?? "");
        setCategoryIds(data.categoryIds);
        setImages(data.images);
        setOemCodesText(data.oemCodes.join("\n"));

        // Rebuild compatibility rows — resolve brand for each generation's
        // model by walking vehicle brands (best effort; user can re-pick).
        const rows: CompatibilityRow[] = data.compatibility.map((entry) => ({
          key: newRowKey(),
          vehicleBrandId: "",
          models: [],
          vehicleModelId: "",
          generations: [],
          vehicleGenerationId: String(entry.vehicleGenerationId),
          installationPosition: entry.installationPosition,
        }));
        setCompatRows(rows);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── category checkbox toggle ─────────────────────────────────────────
  const toggleCategory = (catId: number) => {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  // ── images ────────────────────────────────────────────────────────────
  const addImage = () => {
    setImages((prev) => [
      ...prev,
      { imageUrl: "", altText: "", isThumbnail: prev.length === 0, displayOrder: prev.length },
    ]);
  };
  const updateImage = (idx: number, patch: Partial<AdminProductImagePayload>) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)));
  };
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const setThumbnail = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isThumbnail: i === idx })));
  };

  // ── compatibility rows ───────────────────────────────────────────────
  const addCompatRow = () => {
    setCompatRows((prev) => [
      ...prev,
      {
        key: newRowKey(),
        vehicleBrandId: "",
        models: [],
        vehicleModelId: "",
        generations: [],
        vehicleGenerationId: "",
        installationPosition: "chung",
      },
    ]);
  };
  const removeCompatRow = (key: string) => {
    setCompatRows((prev) => prev.filter((r) => r.key !== key));
  };

  const onCompatBrandChange = useCallback(
    async (key: string, brandId: string) => {
      setCompatRows((prev) =>
        prev.map((r) =>
          r.key === key
            ? { ...r, vehicleBrandId: brandId, models: [], vehicleModelId: "", generations: [], vehicleGenerationId: "" }
            : r,
        ),
      );
      const brand = vehicleBrands.find((b) => String(b.id) === brandId);
      if (!brand) return;
      try {
        const { data } = await fetchVehicleBrandBySlug(brand.slug);
        setCompatRows((prev) =>
          prev.map((r) => (r.key === key ? { ...r, models: data.models } : r)),
        );
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [vehicleBrands],
  );

  const onCompatModelChange = useCallback(async (key: string, modelId: string) => {
    setCompatRows((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, vehicleModelId: modelId, generations: [], vehicleGenerationId: "" }
          : r,
      ),
    );
    if (!modelId) return;
    try {
      const { data } = await fetchVehicleGenerationsByModelId(Number(modelId));
      setCompatRows((prev) =>
        prev.map((r) => (r.key === key ? { ...r, generations: data } : r)),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const onCompatGenerationChange = (key: string, generationId: string) => {
    setCompatRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, vehicleGenerationId: generationId } : r)),
    );
  };

  const onCompatPositionChange = (key: string, position: string) => {
    setCompatRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, installationPosition: position } : r)),
    );
  };

  // ── submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sku.trim() || !productBrandId) {
      setError("Vui lòng nhập đủ Tên sản phẩm, SKU và Thương hiệu.");
      return;
    }

    const oemCodes = oemCodesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const compatibility: AdminProductCompatibilityPayload[] = compatRows
      .filter((r) => r.vehicleGenerationId)
      .map((r) => ({
        vehicleGenerationId: Number(r.vehicleGenerationId),
        installationPosition: r.installationPosition,
      }));

    const validImages = images.filter((img) => img.imageUrl.trim());

    const payload = {
      productBrandId: Number(productBrandId),
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      specification: specification.trim() || undefined,
      status: status as "con_hang" | "het_hang" | "ngung_kinh_doanh",
      categoryIds,
      images: validImages,
      oemCodes,
      compatibility,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(Number(id), payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/san-pham");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </header>

      <main style={styles.main}>
        <Link to="/admin/san-pham" style={styles.backLink}>
          ← Quản lý Sản phẩm
        </Link>
        <h2>{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ── Thông tin cơ bản ─────────────────────────────────── */}
            <section style={styles.section}>
              <h3>Thông tin cơ bản</h3>
              <Input
                label="Tên sản phẩm *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p style={styles.slugPreview}>Slug: /{slugPreview || "…"}</p>

              <Input
                label="SKU *"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />

              <Select
                label="Thương hiệu *"
                value={productBrandId}
                onChange={(e) => setProductBrandId(e.target.value)}
                placeholder="— Chọn thương hiệu —"
                options={brands.map((b) => ({ value: String(b.id), label: b.name }))}
                required
              />

              <Select
                label="Trạng thái"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />

              <Textarea
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Textarea
                label="Thông số kỹ thuật"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
              />
            </section>

            {/* ── Danh mục ─────────────────────────────────────────── */}
            <section style={styles.section}>
              <h3>Danh mục</h3>
              <div style={styles.checkGrid}>
                {categories.map((c) => (
                  <Checkbox
                    key={c.id}
                    label={c.name}
                    checked={categoryIds.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                ))}
              </div>
            </section>

            {/* ── Ảnh sản phẩm ─────────────────────────────────────── */}
            <section style={styles.section}>
              <h3>Ảnh sản phẩm</h3>
              {images.map((img, idx) => (
                <div key={idx} style={styles.imageRow}>
                  <div style={{ flex: 1 }}>
                    <Input
                      placeholder="Dán URL ảnh — không hỗ trợ upload file trực tiếp"
                      value={img.imageUrl}
                      onChange={(e) => updateImage(idx, { imageUrl: e.target.value })}
                    />
                  </div>
                  <Checkbox
                    label="Ảnh đại diện"
                    checked={!!img.isThumbnail}
                    onChange={() => setThumbnail(idx)}
                  />
                  <Button type="button" variant="danger" size="sm" onClick={() => removeImage(idx)}>
                    Xóa
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addImage}>
                + Thêm ảnh
              </Button>
            </section>

            {/* ── Mã OEM ───────────────────────────────────────────── */}
            <section style={styles.section}>
              <h3>Mã OEM</h3>
              <Textarea
                label="Mã OEM (mỗi mã 1 dòng hoặc cách nhau bằng dấu phẩy)"
                value={oemCodesText}
                onChange={(e) => setOemCodesText(e.target.value)}
              />
            </section>

            {/* ── Xe tương thích ───────────────────────────────────── */}
            <section style={styles.section}>
              <h3>Xe tương thích</h3>
              {compatRows.map((row) => (
                <div key={row.key} style={styles.compatRow}>
                  <Select
                    label="Hãng xe"
                    value={row.vehicleBrandId}
                    onChange={(e) => onCompatBrandChange(row.key, e.target.value)}
                    placeholder="— Chọn hãng xe —"
                    options={vehicleBrands.map((b) => ({ value: String(b.id), label: b.name }))}
                  />
                  <Select
                    label="Dòng xe"
                    value={row.vehicleModelId}
                    onChange={(e) => onCompatModelChange(row.key, e.target.value)}
                    placeholder="— Chọn dòng xe —"
                    options={row.models.map((m) => ({ value: String(m.id), label: m.name }))}
                    disabled={row.models.length === 0}
                  />
                  <Select
                    label="Đời xe"
                    value={row.vehicleGenerationId}
                    onChange={(e) => onCompatGenerationChange(row.key, e.target.value)}
                    placeholder="— Chọn đời xe —"
                    options={row.generations.map((g) => ({
                      value: String(g.id),
                      label: `${g.name} (${g.yearStart}–${g.yearEnd ?? "nay"})`,
                    }))}
                    disabled={row.generations.length === 0}
                  />
                  <Select
                    label="Vị trí lắp"
                    value={row.installationPosition}
                    onChange={(e) => onCompatPositionChange(row.key, e.target.value)}
                    options={POSITION_OPTIONS}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeCompatRow(row.key)}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addCompatRow}>
                + Thêm xe tương thích
              </Button>
            </section>

            <div style={styles.submitRow}>
              <Button type="submit" variant="primary" loading={saving}>
                {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/admin/san-pham")}>
                Hủy
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1, maxWidth: 900 },
  backLink: { color: "#666", fontSize: "0.875rem", textDecoration: "none" },
  error: { color: "#b91c1c", margin: "1rem 0" },
  section: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "1.25rem",
    marginBottom: "1.25rem",
  },
  slugPreview: { color: "#666", fontSize: "0.8rem", marginTop: "-0.5rem", marginBottom: "0.75rem" },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "0.5rem",
  },
  imageRow: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" },
  compatRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    gap: "0.75rem",
    alignItems: "end",
    marginBottom: "0.75rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px dashed #e5e7eb",
  },
  submitRow: { display: "flex", gap: "0.75rem" },
};

export default AdminProductFormPage;
