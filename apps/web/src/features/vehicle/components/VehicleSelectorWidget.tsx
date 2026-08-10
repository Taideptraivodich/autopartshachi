import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Select from "../../../components/ui/Select";
import {
  fetchAllVehicleBrands,
  fetchModelsByBrandId,
  fetchVehicleGenerationsByModelId,
} from "../../product/api/product.api";
import {
  useVehicleSelector,
  type SelectedVehicle,
} from "../hooks/useVehicleSelector";
import type {
  VehicleBrandListItem,
  VehicleModelItem,
  VehicleGenerationItem,
} from "../../product/api/types";
import styles from "./VehicleSelectorWidget.module.css";

interface VehicleSelectorWidgetProps {
  mode: "full" | "compact";
  onVehicleSelect?: (vehicle: SelectedVehicle | null) => void;
}

const VehicleSelectorWidget: React.FC<VehicleSelectorWidgetProps> = ({
  mode,
  onVehicleSelect,
}) => {
  const { getSelected, setSelected, clearSelected } = useVehicleSelector();

  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]);
  const [models, setModels] = useState<VehicleModelItem[]>([]);
  const [generations, setGenerations] = useState<VehicleGenerationItem[]>([]);

  const [selectedBrandId, setSelectedBrandId] = useState<number | "">("");
  const [selectedModelId, setSelectedModelId] = useState<number | "">("");
  const [selectedGenId, setSelectedGenId] = useState<number | "">("");
  const [currentVehicle, setCurrentVehicle] = useState<SelectedVehicle | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGens, setLoadingGens] = useState(false);

  // Mount: load saved vehicle + brands
  useEffect(() => {
    const saved = getSelected();
    if (saved) {
      setCurrentVehicle(saved);
      setSelectedBrandId(saved.brandId);
      setSelectedModelId(saved.modelId);
      setSelectedGenId(saved.generationId);
    }

    fetchAllVehicleBrands().then((res) => setBrands(res.data)).catch(console.error);
  }, []);

  // When saved brandId is set, load models for pre-populate
  useEffect(() => {
    if (selectedBrandId === "") return;
    setLoadingModels(true);
    fetchModelsByBrandId(selectedBrandId as number)
      .then((res) => setModels(res.data))
      .catch(console.error)
      .finally(() => setLoadingModels(false));
  }, [selectedBrandId]);

  // When saved modelId is set, load generations for pre-populate
  useEffect(() => {
    if (selectedModelId === "") return;
    setLoadingGens(true);
    fetchVehicleGenerationsByModelId(selectedModelId as number)
      .then((res) => setGenerations(res.data))
      .catch(console.error)
      .finally(() => setLoadingGens(false));
  }, [selectedModelId]);

  const handleBrandChange = useCallback(
    async (brandIdStr: string) => {
      const brandId = brandIdStr === "" ? "" : Number(brandIdStr);
      setSelectedBrandId(brandId);
      setSelectedModelId("");
      setSelectedGenId("");
      setModels([]);
      setGenerations([]);
      setCurrentVehicle(null);

      if (brandId === "") return;

      setLoadingModels(true);
      try {
        const res = await fetchModelsByBrandId(brandId as number);
        setModels(res.data);
      } catch {
        // ignore
      } finally {
        setLoadingModels(false);
      }
    },
    [],
  );

  const handleModelChange = useCallback(
    async (modelIdStr: string) => {
      const modelId = modelIdStr === "" ? "" : Number(modelIdStr);
      setSelectedModelId(modelId);
      setSelectedGenId("");
      setGenerations([]);
      setCurrentVehicle(null);

      if (modelId === "") return;

      setLoadingGens(true);
      try {
        const res = await fetchVehicleGenerationsByModelId(modelId as number);
        setGenerations(res.data);
      } catch {
        // ignore
      } finally {
        setLoadingGens(false);
      }
    },
    [],
  );

  const handleGenChange = useCallback(
    (genIdStr: string) => {
      const genId = genIdStr === "" ? "" : Number(genIdStr);
      setSelectedGenId(genId);

      if (genId === "" || selectedBrandId === "" || selectedModelId === "") return;

      const brand = brands.find((b) => b.id === selectedBrandId);
      const model = models.find((m) => m.id === selectedModelId);
      const gen = generations.find((g) => g.id === genId);
      if (!brand || !model || !gen) return;

      const yearStr = gen.yearEnd ? `${gen.yearStart}–${gen.yearEnd}` : `${gen.yearStart}–nay`;
      const generationLabel = `${brand.name} ${model.name} (${yearStr})`;

      const vehicle: SelectedVehicle = {
        brandId: brand.id,
        brandName: brand.name,
        brandSlug: brand.slug,
        modelId: model.id,
        modelName: model.name,
        generationId: gen.id,
        generationName: yearStr,
        generationLabel,
      };

      setSelected(vehicle);
      setCurrentVehicle(vehicle);
      onVehicleSelect?.(vehicle);
    },
    [brands, models, generations, selectedBrandId, selectedModelId, setSelected, onVehicleSelect],
  );

  const handleClear = useCallback(() => {
    clearSelected();
    setCurrentVehicle(null);
    setSelectedBrandId("");
    setSelectedModelId("");
    setSelectedGenId("");
    setModels([]);
    setGenerations([]);
    onVehicleSelect?.(null);
  }, [clearSelected, onVehicleSelect]);

  // ── compact mode ──────────────────────────────────────────────────────────
  if (mode === "compact") {
    if (currentVehicle) {
      return (
        <div className={styles.compact}>
          <span>🚗</span>
          <span className={styles.compactLabel} title={currentVehicle.generationLabel}>
            {currentVehicle.brandName} {currentVehicle.modelName} {currentVehicle.generationName.split("–")[0]}
          </span>
          <button className={styles.clearBtn} onClick={handleClear} title="Bỏ chọn xe" aria-label="Bỏ chọn xe">
            ✕
          </button>
        </div>
      );
    }
    return (
      <Link to="/hang-xe" className={styles.compact}>
        <span>🚗</span>
        <span>Chọn xe</span>
      </Link>
    );
  }

  // ── full mode ─────────────────────────────────────────────────────────────
  const brandOptions = brands.map((b) => ({ value: String(b.id), label: b.name }));
  const modelOptions = models.map((m) => ({ value: String(m.id), label: m.name }));
  const genOptions = generations.map((g) => {
    const yr = g.yearEnd ? `${g.yearStart}–${g.yearEnd}` : `${g.yearStart}–nay`;
    return { value: String(g.id), label: `${g.name} (${yr})` };
  });

  const canNavigate = selectedGenId !== "" && selectedBrandId !== "" && selectedModelId !== "";

  return (
    <div className={styles.widget}>
      <p className={styles.widgetTitle}>
        <span>🚗</span>
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
          label="Đời xe"
          placeholder={loadingGens ? "Đang tải..." : "-- Chọn đời --"}
          options={genOptions}
          value={String(selectedGenId)}
          onChange={(e) => handleGenChange(e.target.value)}
          disabled={selectedModelId === "" || loadingGens}
        />
      </div>
      <div className={styles.ctaRow}>
        {canNavigate ? (
          <Link
            to={`/san-pham?vehicleGenerationId=${selectedGenId}`}
            className={styles.ctaButton}
          >
            → Xem phụ tùng phù hợp
          </Link>
        ) : (
          <span className={styles.ctaHint}>Chọn đủ 3 cấp để tìm phụ tùng phù hợp</span>
        )}
        {currentVehicle && (
          <button className={styles.clearBtn} onClick={handleClear}>
            ✕ Bỏ chọn
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleSelectorWidget;
