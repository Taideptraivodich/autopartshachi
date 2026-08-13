import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Select from "../../../components/ui/Select";
import { fetchAllVehicleBrands, fetchModelsByBrandId } from "../../product/api/product.api";
import { useVehicleSelector, type SelectedVehicle } from "../hooks/useVehicleSelector";
import type { VehicleBrandListItem, VehicleModelItem } from "../../product/api/types";
import styles from "./VehicleSelectorWidget.module.css";

interface VehicleSelectorWidgetProps {
  mode: "full" | "compact";
  onVehicleSelect?: (vehicle: SelectedVehicle | null) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

const VehicleSelectorWidget: React.FC<VehicleSelectorWidgetProps> = ({ mode, onVehicleSelect }) => {
  const { getSelected, setSelected, clearSelected } = useVehicleSelector();

  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]);
  const [models, setModels] = useState<VehicleModelItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | "">("");
  const [selectedModelId, setSelectedModelId] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [currentVehicle, setCurrentVehicle] = useState<SelectedVehicle | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    fetchAllVehicleBrands().then((res) => setBrands(res.data)).catch(() => setBrands([]));
    const saved = getSelected();
    if (!saved) return;

    setCurrentVehicle(saved);
    setSelectedBrandId(saved.brandId);
    setSelectedModelId(saved.modelId);
    setSelectedYear(String(saved.year));

    setLoadingModels(true);
    fetchModelsByBrandId(saved.brandId)
      .then((res) => setModels(res.data))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBrandChange = useCallback(async (brandIdStr: string) => {
    const brandId = brandIdStr === "" ? "" : Number(brandIdStr);
    setSelectedBrandId(brandId);
    setSelectedModelId("");
    setSelectedYear("");
    setModels([]);
    setCurrentVehicle(null);
    clearSelected();
    onVehicleSelect?.(null);

    if (brandId === "") return;
    setLoadingModels(true);
    try {
      const res = await fetchModelsByBrandId(brandId);
      setModels(res.data);
    } catch {
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [clearSelected, onVehicleSelect]);

  const handleModelChange = useCallback((modelIdStr: string) => {
    const modelId = modelIdStr === "" ? "" : Number(modelIdStr);
    setSelectedModelId(modelId);
    setSelectedYear("");
    setCurrentVehicle(null);
    clearSelected();
    onVehicleSelect?.(null);
  }, [clearSelected, onVehicleSelect]);

  const handleYearChange = useCallback((yearStr: string) => {
    setSelectedYear(yearStr);
    if (!yearStr || selectedBrandId === "" || selectedModelId === "") return;

    const brand = brands.find((b) => b.id === selectedBrandId);
    const model = models.find((m) => m.id === selectedModelId);
    const year = Number(yearStr);
    if (!brand || !model || !Number.isInteger(year) || year < 1990 || year > CURRENT_YEAR + 2) return;

    const vehicle: SelectedVehicle = {
      brandId: brand.id,
      brandName: brand.name,
      brandSlug: brand.slug,
      modelId: model.id,
      modelName: model.name,
      year,
      vehicleLabel: `${brand.name} ${model.name} (${year})`,
    };

    setSelected(vehicle);
    setCurrentVehicle(vehicle);
    onVehicleSelect?.(vehicle);
  }, [brands, models, selectedBrandId, selectedModelId, setSelected, onVehicleSelect]);

  const handleClear = useCallback(() => {
    clearSelected();
    setCurrentVehicle(null);
    setSelectedBrandId("");
    setSelectedModelId("");
    setSelectedYear("");
    setModels([]);
    onVehicleSelect?.(null);
  }, [clearSelected, onVehicleSelect]);

  if (mode === "compact") {
    if (currentVehicle) {
      return (
        <div className={styles.compact}>
          <span className={styles.vehicleMark} aria-hidden="true" />
          <span className={styles.compactLabel} title={currentVehicle.vehicleLabel}>
            {currentVehicle.vehicleLabel}
          </span>
          <button className={styles.clearBtn} onClick={handleClear} title="Bỏ chọn xe" aria-label="Bỏ chọn xe">×</button>
        </div>
      );
    }
    return (
      <Link to="/hang-xe" className={styles.compact}>
        <span className={styles.vehicleMark} aria-hidden="true" />
        <span>Chọn xe</span>
      </Link>
    );
  }

  const brandOptions = brands.map((b) => ({ value: String(b.id), label: b.name }));
  const modelOptions = models.map((m) => ({ value: String(m.id), label: m.name }));
  const yearOptions = Array.from({ length: CURRENT_YEAR + 2 - 1990 + 1 }, (_, i) => CURRENT_YEAR + 2 - i)
    .map((year) => ({ value: String(year), label: String(year) }));
  const canNavigate = selectedBrandId !== "" && selectedModelId !== "" && selectedYear !== "";

  return (
    <div className={styles.widget}>
      <p className={styles.widgetTitle}>
        <span className={styles.vehicleMark} aria-hidden="true" />
        <span>Chọn xe của bạn</span>
      </p>
      <div className={styles.dropdownRow}>
        <Select
          label="Hãng xe"
          placeholder="-- Chọn hãng --"
          options={brandOptions}
          value={String(selectedBrandId)}
          onChange={(e) => handleBrandChange(e.target.value)}
        />
        <Select
          label="Dòng xe"
          placeholder={loadingModels ? "Đang tải..." : "-- Chọn dòng --"}
          options={modelOptions}
          value={String(selectedModelId)}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={selectedBrandId === "" || loadingModels}
        />
        <Select
          label="Năm xe"
          placeholder="-- Chọn năm --"
          options={yearOptions}
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={selectedModelId === ""}
        />
      </div>
      <div className={styles.ctaRow}>
        {canNavigate ? (
          <Link to={`/san-pham?vehicleModelId=${selectedModelId}&vehicleYear=${selectedYear}`} className={styles.ctaButton}>
            Xem phụ tùng phù hợp <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className={styles.ctaHint}>Chọn hãng, dòng và năm xe để tìm phụ tùng phù hợp</span>
        )}
        {currentVehicle && (
          <button className={styles.clearBtn} onClick={handleClear}>× Bỏ chọn</button>
        )}
      </div>
    </div>
  );
};

export default VehicleSelectorWidget;
