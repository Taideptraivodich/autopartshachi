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
} from "../../../features/product/api/product.api";
import { createAdminBrand, createAdminCategory, uploadImage } from "../../../features/admin/api/admin-catalog.api";
import type { BrandListItem, CategoryListItem, VehicleBrandListItem, VehicleModelItem } from "../../../features/product/api/types";

const STATUS_OPTIONS = [
  { value: "con_hang", label: "Còn hàng" },
  { value: "het_hang", label: "Hết hàng" },
  { value: "ngung_kinh_doanh", label: "Ngừng kinh doanh" },
];
const POSITION_OPTIONS = [
  { value: "chung", label: "Chung" }, { value: "truoc", label: "Trước" }, { value: "sau", label: "Sau" },
  { value: "truoc_trai", label: "Trước trái" }, { value: "truoc_phai", label: "Trước phải" },
  { value: "sau_trai", label: "Sau trái" }, { value: "sau_phai", label: "Sau phải" },
];
const YEAR_OPTIONS = Array.from({ length: 76 }, (_, i) => String(1960 + i));
const BEFORE_YEAR = "__before__";

function slugifyPreview(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `http://localhost:3001${url}`;
  return url;
}

interface CompatibilityRow {
  key: string; vehicleBrandId: string; models: VehicleModelItem[]; vehicleModelId: string;
  yearStart: string; yearStartMode: "year" | "before"; yearEnd: string; untilNow: boolean; allYears: boolean; installationPosition: string;
}
let rowKeySeq = 0;
function newRowKey(): string { rowKeySeq += 1; return `row-${rowKeySeq}`; }
type QuickCreateKind = "brand" | "category" | null;
const emptyCompatRow = (): CompatibilityRow => ({ key: newRowKey(), vehicleBrandId: "", models: [], vehicleModelId: "", yearStart: "", yearStartMode: "year", yearEnd: "", untilNow: false, allYears: false, installationPosition: "chung" });

const AdminProductFormPage: React.FC = () => {
  const { logout } = useAdminAuth(); const navigate = useNavigate(); const { id } = useParams<{ id: string }>(); const isEdit = !!id;
  const [brands, setBrands] = useState<BrandListItem[]>([]); const [categories, setCategories] = useState<CategoryListItem[]>([]); const [vehicleBrands, setVehicleBrands] = useState<VehicleBrandListItem[]>([]);
  const [name, setName] = useState(""); const [sku, setSku] = useState(""); const [productBrandId, setProductBrandId] = useState(""); const [status, setStatus] = useState("con_hang");
  const [description, setDescription] = useState(""); const [specification, setSpecification] = useState(""); const [categoryIds, setCategoryIds] = useState<number[]>([]); const [images, setImages] = useState<AdminProductImagePayload[]>([]); const [oemCodesText, setOemCodesText] = useState(""); const [compatRows, setCompatRows] = useState<CompatibilityRow[]>([]);
  const [loading, setLoading] = useState(isEdit); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null); const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [quickCreateKind, setQuickCreateKind] = useState<QuickCreateKind>(null); const [quickCreateName, setQuickCreateName] = useState(""); const [quickCreateLogoUrl, setQuickCreateLogoUrl] = useState<string | null>(null); const [quickCreateUploading, setQuickCreateUploading] = useState(false); const [quickCreateSaving, setQuickCreateSaving] = useState(false);
  const slugPreview = useMemo(() => slugifyPreview(name), [name]);

  useEffect(() => { (async () => { try { const [b, c, vb] = await Promise.all([fetchAllBrands(), fetchAllCategories(), fetchAllVehicleBrands()]); setBrands(b.data); setCategories(c.data); setVehicleBrands(vb.data); } catch (err) { setError((err as Error).message); } })(); }, []);
  useEffect(() => { if (!id) return; (async () => { setLoading(true); try { const { data } = await fetchProductAdminById(Number(id)); setName(data.name); setSku(data.sku); setProductBrandId(String(data.productBrandId)); setStatus(data.status); setDescription(data.description ?? ""); setSpecification(data.specification ?? ""); setCategoryIds(data.categoryIds); setImages(data.images); setOemCodesText(data.oemCodes.join("\n")); setCompatRows(data.compatibility.map((entry) => { const allYears = entry.yearStart == null && entry.yearEnd == null; return { key: newRowKey(), vehicleBrandId: "", models: [], vehicleModelId: String(entry.vehicleModelId), yearStart: entry.yearStart == null ? "" : String(entry.yearStart), yearStartMode: entry.yearStart == null ? "before" : "year", yearEnd: entry.yearEnd == null ? "" : String(entry.yearEnd), untilNow: entry.yearEnd == null, allYears, installationPosition: entry.installationPosition }; })); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } })(); }, [id]);

  const toggleCategory = (catId: number) => setCategoryIds((prev) => prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]);
  const openQuickCreate = (kind: Exclude<QuickCreateKind, null>) => { setQuickCreateKind(kind); setQuickCreateName(""); setQuickCreateLogoUrl(null); setQuickCreateUploading(false); };
  const closeQuickCreate = () => { if (quickCreateSaving || quickCreateUploading) return; setQuickCreateKind(null); setQuickCreateName(""); setQuickCreateLogoUrl(null); };
  const handleQuickCreateLogoSelect = async (file: File) => { setQuickCreateUploading(true); setError(null); try { setQuickCreateLogoUrl(await uploadImage(file)); } catch (err) { setError(`Upload logo thất bại: ${(err as Error).message}`); } finally { setQuickCreateUploading(false); } };
  const handleQuickCreate = async () => { const trimmed = quickCreateName.trim(); if (!trimmed || !quickCreateKind || quickCreateUploading) return; setQuickCreateSaving(true); setError(null); try { if (quickCreateKind === "brand") { const created = await createAdminBrand(trimmed, true, quickCreateLogoUrl); setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name))); setProductBrandId(String(created.id)); } else { const created = await createAdminCategory({ name: trimmed, parentCategoryId: null, isActive: true }); const createdCategory: CategoryListItem = { id: created.id, name: created.name, slug: created.slug, parentCategoryId: created.parentCategoryId, displayOrder: 0 }; setCategories((prev) => [...prev, createdCategory].sort((a, b) => a.name.localeCompare(b.name))); setCategoryIds((prev) => prev.includes(created.id) ? prev : [...prev, created.id]); } closeQuickCreate(); } catch (err) { setError((err as Error).message); } finally { setQuickCreateSaving(false); } };

  const addImage = () => setImages((prev) => [...prev, { imageUrl: "", altText: "", isThumbnail: prev.length === 0, displayOrder: prev.length }]);
  const updateImage = (idx: number, patch: Partial<AdminProductImagePayload>) => setImages((prev) => prev.map((img, i) => i === idx ? { ...img, ...patch } : img));
  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const setThumbnail = (idx: number) => setImages((prev) => prev.map((img, i) => ({ ...img, isThumbnail: i === idx })));
  const handleFileSelect = async (idx: number, file: File) => { setUploadingIdx(idx); setError(null); try { updateImage(idx, { imageUrl: `http://localhost:3001${await uploadImage(file)}` }); } catch (e) { setError(`Upload ảnh thất bại: ${(e as Error).message}`); } finally { setUploadingIdx(null); } };

  const addCompatRow = () => setCompatRows((prev) => [...prev, emptyCompatRow()]);
  const removeCompatRow = (key: string) => setCompatRows((prev) => prev.filter((r) => r.key !== key));
  const onCompatBrandChange = useCallback(async (key: string, brandId: string) => { setCompatRows((prev) => prev.map((r) => r.key === key ? { ...r, vehicleBrandId: brandId, models: [], vehicleModelId: "", yearStart: "", yearStartMode: "year", yearEnd: "", untilNow: false, allYears: false } : r)); const brand = vehicleBrands.find((b) => String(b.id) === brandId); if (!brand) return; try { const { data } = await fetchVehicleBrandBySlug(brand.slug); setCompatRows((prev) => prev.map((r) => r.key === key ? { ...r, models: data.models } : r)); } catch (err) { setError((err as Error).message); } }, [vehicleBrands]);
  const onCompatModelChange = useCallback((key: string, modelId: string) => setCompatRows((prev) => prev.map((r) => r.key === key ? { ...r, vehicleModelId: modelId, yearStart: "", yearStartMode: "year", yearEnd: "", untilNow: false, allYears: false } : r)), []);
  const updateCompatRow = (key: string, patch: Partial<CompatibilityRow>) => setCompatRows((prev) => prev.map((r) => r.key === key ? { ...r, ...patch } : r));
  const handleStartModeChange = (key: string, value: string) => { if (value === BEFORE_YEAR) updateCompatRow(key, { yearStartMode: "before", yearStart: "", allYears: false }); else updateCompatRow(key, { yearStartMode: "year", yearStart: value, allYears: false }); };
  const setAllYears = (key: string, checked: boolean) => updateCompatRow(key, checked ? { allYears: true, yearStartMode: "before", yearStart: "", yearEnd: "", untilNow: true } : { allYears: false, yearStartMode: "year", yearStart: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); if (!name.trim() || !sku.trim() || !productBrandId) { setError("Vui lòng nhập đủ Tên sản phẩm, SKU và Thương hiệu."); return; }
    const oemCodes = oemCodesText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    for (const r of compatRows) { if (!r.vehicleModelId) continue; if (!r.allYears && r.yearStartMode === "year" && !r.yearStart) { setError("Mỗi xe tương thích cần có Từ năm hoặc chọn Từ trước."); return; } if (!r.allYears && !r.yearEnd && r.yearStartMode === "before") { setError("Khi chọn Từ trước, cần nhập Đến năm."); return; } if (!r.allYears && !r.untilNow && r.yearStartMode === "year" && r.yearStart && r.yearEnd && Number(r.yearEnd) < Number(r.yearStart)) { setError("Đến năm không được nhỏ hơn Từ năm."); return; } }
    const compatibility: AdminProductCompatibilityPayload[] = compatRows.filter((r) => r.vehicleModelId).map((r) => ({ vehicleModelId: Number(r.vehicleModelId), yearStart: r.allYears || r.yearStartMode === "before" ? null : Number(r.yearStart), yearEnd: r.allYears || r.untilNow ? null : (r.yearEnd ? Number(r.yearEnd) : null), installationPosition: r.installationPosition }));
    const payload = { productBrandId: Number(productBrandId), sku: sku.trim(), name: name.trim(), description: description.trim() || undefined, specification: specification.trim() || undefined, status: status as "con_hang" | "het_hang" | "ngung_kinh_doanh", categoryIds, images: images.filter((img) => img.imageUrl.trim()), oemCodes, compatibility };
    setSaving(true); try { if (isEdit) await updateProduct(Number(id), payload); else await createProduct(payload); navigate("/admin/san-pham"); } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  return (
    <div style={styles.page}><header style={styles.header}><span style={styles.logo}>Hachi Admin</span><Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button></header><main style={styles.main}><Link to="/admin/san-pham" style={styles.backLink}>← Quản lý Sản phẩm</Link><h2>{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>{error && <p style={styles.error}>{error}</p>}{loading ? <p>Đang tải...</p> : <form onSubmit={handleSubmit}>
      <section style={styles.section}><h3>Thông tin cơ bản</h3><div style={styles.actionField}><Select label="Thương hiệu *" value={productBrandId} onChange={(e) => setProductBrandId(e.target.value)} placeholder="— Chọn thương hiệu —" options={brands.map((b) => ({ value: String(b.id), label: b.name }))} required/><Button type="button" variant="secondary" size="sm" onClick={() => openQuickCreate("brand")}>+ Thương hiệu mới</Button></div><Input label="Tên sản phẩm *" value={name} onChange={(e) => setName(e.target.value)} required/><p style={styles.slugPreview}>Slug: /{slugPreview || "…"}</p><Input label="SKU *" value={sku} onChange={(e) => setSku(e.target.value)} required/><Select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS}/><Textarea label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)}/><Textarea label="Thông số kỹ thuật" value={specification} onChange={(e) => setSpecification(e.target.value)}/></section>
      <section style={styles.section}><div style={styles.sectionTitleRow}><h3 style={{margin:0}}>Danh mục</h3><Button type="button" variant="secondary" size="sm" onClick={() => openQuickCreate("category")}>+ Danh mục mới</Button></div><div style={styles.checkGrid}>{categories.map((c)=><Checkbox key={c.id} label={c.name} checked={categoryIds.includes(c.id)} onChange={()=>toggleCategory(c.id)}/>)}</div></section>
      <section style={styles.section}><h3>Ảnh sản phẩm</h3>{images.map((img,idx)=><div key={idx} style={styles.imageRow}><div style={{flex:1}}><div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}><Input placeholder="Dán URL ảnh hoặc tải lên từ máy →" value={img.imageUrl} onChange={(e)=>updateImage(idx,{imageUrl:e.target.value})} style={{flex:1}}/><label style={styles.uploadBtn}>{uploadingIdx===idx?"Đang tải":"Tải ảnh"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{display:"none"}} disabled={uploadingIdx!==null} onChange={(e)=>{const file=e.target.files?.[0];if(file)handleFileSelect(idx,file);e.target.value="";}}/></label></div>{img.imageUrl&&<img src={resolveImageUrl(img.imageUrl)??img.imageUrl} alt="preview" style={styles.imgPreview}/>}</div><Checkbox label="Ảnh đại diện" checked={!!img.isThumbnail} onChange={()=>setThumbnail(idx)}/><Button type="button" variant="danger" size="sm" onClick={()=>removeImage(idx)}>Xóa</Button></div>)}<Button type="button" variant="secondary" size="sm" onClick={addImage}>+ Thêm ảnh</Button></section>
      <section style={styles.section}><h3>Mã OEM</h3><Textarea label="Mã OEM (mỗi mã 1 dòng hoặc cách nhau bằng dấu phẩy)" value={oemCodesText} onChange={(e)=>setOemCodesText(e.target.value)}/></section>
      <section style={styles.section}><div style={styles.compatHeader}><div><h3 style={{marginBottom:4}}>Xe tương thích</h3><p style={styles.compatHint}>Chọn Hãng → Dòng → khung năm áp dụng cho chính sản phẩm này.</p></div></div>{compatRows.map((row)=><div key={row.key} style={styles.compatRow}>
        <Select label="Hãng xe" value={row.vehicleBrandId} onChange={(e)=>onCompatBrandChange(row.key,e.target.value)} placeholder="— Chọn hãng —" options={vehicleBrands.map((b)=>({value:String(b.id),label:b.name}))}/>
        <Select label="Dòng xe" value={row.vehicleModelId} onChange={(e)=>onCompatModelChange(row.key,e.target.value)} placeholder="— Chọn dòng —" options={row.models.map((m)=>({value:String(m.id),label:m.name}))} disabled={!row.vehicleBrandId||row.models.length===0}/>
        <div style={styles.yearField}><label style={styles.yearLabel}>Từ năm</label><select value={row.allYears?BEFORE_YEAR:row.yearStartMode==="before"?BEFORE_YEAR:row.yearStart} onChange={(e)=>handleStartModeChange(row.key,e.target.value)} disabled={row.allYears} style={styles.yearSelect}><option value="">— Chọn năm —</option><option value={BEFORE_YEAR}>Từ trước</option>{YEAR_OPTIONS.map((y)=><option key={y} value={y}>{y}</option>)}</select></div>
        <div style={styles.yearField}><label style={styles.yearLabel}>Đến năm</label><select value={row.untilNow?"":row.yearEnd} onChange={(e)=>updateCompatRow(row.key,{yearEnd:e.target.value})} disabled={row.untilNow||row.allYears} style={styles.yearSelect}><option value="">— Chọn năm —</option>{YEAR_OPTIONS.map((y)=><option key={y} value={y}>{y}</option>)}</select><label style={styles.untilNowLabel}><input type="checkbox" checked={row.untilNow} disabled={row.allYears||row.yearStartMode==="before"} onChange={(e)=>updateCompatRow(row.key,{untilNow:e.target.checked,yearEnd:""})}/>Đến nay</label></div>
        <label style={styles.allYearsLabel}><input type="checkbox" checked={row.allYears} onChange={(e)=>setAllYears(row.key,e.target.checked)}/>Tất cả các đời</label>
        <Select label="Vị trí lắp" value={row.installationPosition} onChange={(e)=>updateCompatRow(row.key,{installationPosition:e.target.value})} options={POSITION_OPTIONS}/><Button type="button" variant="danger" size="sm" onClick={()=>removeCompatRow(row.key)}>Xóa</Button>
      </div>)}<Button type="button" variant="secondary" size="sm" onClick={addCompatRow}>+ Thêm xe tương thích</Button></section>
      <div style={styles.submitRow}><Button type="submit" variant="primary" loading={saving}>{isEdit?"Lưu thay đổi":"Tạo sản phẩm"}</Button><Button type="button" variant="ghost" onClick={()=>navigate("/admin/san-pham")}>Hủy</Button></div>
    </form>}</main>
    {quickCreateKind&&<div style={styles.modalBackdrop} role="presentation" onMouseDown={closeQuickCreate}><div style={styles.modal} onMouseDown={(e)=>e.stopPropagation()}><h3 style={{marginTop:0}}>{quickCreateKind==="brand"?"Tạo thương hiệu mới":"Tạo danh mục mới"}</h3><Input label={quickCreateKind==="brand"?"Tên thương hiệu *":"Tên danh mục *"} value={quickCreateName} onChange={(e)=>setQuickCreateName(e.target.value)} autoFocus placeholder={quickCreateKind==="brand"?"Ví dụ: Bosch, Denso...":"Ví dụ: Hệ thống lọc"}/>{quickCreateKind==="brand"&&<div style={styles.quickLogoBlock}><div style={styles.quickLogoLabel}>Logo thương hiệu</div>{quickCreateLogoUrl&&<div style={styles.quickLogoPreviewRow}><img src={resolveImageUrl(quickCreateLogoUrl)??quickCreateLogoUrl} alt="Logo xem trước" style={styles.quickLogoPreview}/><button type="button" onClick={()=>setQuickCreateLogoUrl(null)} disabled={quickCreateUploading||quickCreateSaving} style={styles.quickLogoRemove}>Xóa ảnh</button></div>}<label style={styles.quickLogoUploadBtn}><span>{quickCreateUploading?"Đang tải lên…":quickCreateLogoUrl?"Đổi ảnh":"Chọn ảnh từ máy"}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{display:"none"}} disabled={quickCreateUploading||quickCreateSaving} onChange={(e)=>{const file=e.target.files?.[0];if(file)handleQuickCreateLogoSelect(file);e.target.value="";}}/></label><span style={styles.quickLogoHint}>JPEG, PNG, WebP — tối đa 5MB</span></div>}<div style={styles.modalActions}><Button type="button" variant="ghost" onClick={closeQuickCreate} disabled={quickCreateSaving||quickCreateUploading}>Hủy</Button><Button type="button" variant="primary" loading={quickCreateSaving} disabled={!quickCreateName.trim()||quickCreateUploading} onClick={handleQuickCreate}>Tạo</Button></div></div></div>}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",display:"flex",flexDirection:"column"},header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.75rem 1.5rem",borderBottom:"1px solid #e5e7eb",background:"#fff"},logo:{fontWeight:700,fontSize:"1rem",color:"#111"},main:{padding:"2rem 1.5rem",flex:1,maxWidth:1100},backLink:{color:"#666",fontSize:"0.875rem",textDecoration:"none"},error:{color:"#b91c1c",margin:"1rem 0"},section:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"1.25rem",marginBottom:"1.25rem"},sectionTitleRow:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",marginBottom:"1rem"},actionField:{display:"grid",gridTemplateColumns:"1fr auto",gap:"0.75rem",alignItems:"end",marginBottom:"1rem"},slugPreview:{color:"#666",fontSize:"0.8rem",marginTop:"-0.5rem",marginBottom:"0.75rem"},checkGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0.5rem"},imageRow:{display:"flex",alignItems:"flex-start",gap:"0.75rem",marginBottom:"0.75rem"},uploadBtn:{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:72,height:36,borderRadius:6,border:"1px solid #d1d5db",background:"#f9fafb",cursor:"pointer",fontSize:"0.8rem",flexShrink:0,padding:"0 10px"},imgPreview:{display:"block",marginTop:"0.5rem",maxHeight:80,maxWidth:120,borderRadius:4,border:"1px solid #e5e7eb",objectFit:"cover"},compatHeader:{marginBottom:"0.75rem"},compatHint:{margin:0,color:"#667085",fontSize:"0.875rem"},compatRow:{display:"grid",gridTemplateColumns:"1.05fr 1.2fr 0.9fr 0.95fr auto 1fr auto",gap:"0.75rem",alignItems:"start",marginBottom:"0.75rem",padding:"0.9rem 0",borderBottom:"1px dashed #e5e7eb"},yearField:{display:"flex",flexDirection:"column",gap:6},yearLabel:{fontSize:13,fontWeight:500,color:"#344054"},yearSelect:{width:"100%",minHeight:40,boxSizing:"border-box",padding:"8px 10px",border:"1px solid #d0d5dd",borderRadius:6,fontSize:14,background:"#fff"},untilNowLabel:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#667085",cursor:"pointer"},allYearsLabel:{display:"flex",alignItems:"center",gap:6,minHeight:40,fontSize:12,color:"#667085",cursor:"pointer"},submitRow:{display:"flex",gap:"0.75rem"},quickLogoBlock:{marginTop:"0.25rem"},quickLogoLabel:{fontSize:"0.85rem",color:"#374151",marginBottom:6},quickLogoPreviewRow:{display:"flex",alignItems:"center",gap:10,marginBottom:8},quickLogoPreview:{width:56,height:56,objectFit:"contain",border:"1px solid #e5e7eb",borderRadius:6,background:"#f9fafb"},quickLogoRemove:{fontSize:"0.78rem",color:"#b91c1c",background:"none",border:"none",cursor:"pointer",padding:0},quickLogoUploadBtn:{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:130,height:36,borderRadius:6,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer",fontSize:"0.82rem",color:"#374151",padding:"0 12px"},quickLogoHint:{marginLeft:8,fontSize:"0.75rem",color:"#9ca3af"},modalBackdrop:{position:"fixed",inset:0,background:"rgba(15,23,42,0.28)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20},modal:{background:"#fff",borderRadius:12,padding:"1.5rem",width:"min(420px,100%)",boxShadow:"0 24px 64px rgba(15,23,42,0.18)"},modalActions:{display:"flex",justifyContent:"flex-end",gap:"0.75rem",marginTop:"1rem"}
};

export default AdminProductFormPage;
